import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
  return this.prisma.userProfile.findUnique({
    where: {
      userId,
    },
  });
}

async updateProfile(
  userId: string,
  dto: UpdateProfileDto,
) {
  return this.prisma.userProfile.upsert({
    where: {
      userId,
    },
    update: {
      ...dto,
    },
    create: {
      userId,
      ...dto,
    },
  });
}
}