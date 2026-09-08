import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async register(
    userId: string,
    dto: CustomerRegisterDto,
  ) {
    const existingCustomer =
      await this.prisma.customer.findUnique({
        where: {
          userId,
        },
      });

    if (existingCustomer) {
      throw new ConflictException(
        'Customer profile already exists',
      );
    }

    const customer =
      await this.prisma.customer.create({
        data: {
          userId,
        },
      });

    // Update existing UserProfile
    await this.prisma.userProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      update: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    return {
      message: 'Customer registered successfully',
      customer,
    };
  }
}