import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import { PartnerStatus } from '@prisma/client';

@Injectable()
export class PartnerActiveGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException(
        'User authentication information is missing',
      );
    }

    const partner = await this.prisma.partner.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!partner) {
      throw new ForbiddenException(
        'Partner profile not found',
      );
    }

    if (partner.status !== PartnerStatus.ACTIVE) {
      throw new ForbiddenException(
        `Partner account is ${partner.status.toLowerCase()}`,
      );
    }

    // Store partner information for later use
    request.partner = partner;

    return true;
  }
}