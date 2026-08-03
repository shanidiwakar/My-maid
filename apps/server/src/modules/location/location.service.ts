import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCities() {
    return this.prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        state: true,
        country: true,
      },
    });
  }

  async getServiceAreas(cityId: string) {
    const city = await this.prisma.city.findUnique({
      where: {
        id: cityId,
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return this.prisma.serviceArea.findMany({
      where: {
        cityId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        pincode: true,
      },
    });
  }
}