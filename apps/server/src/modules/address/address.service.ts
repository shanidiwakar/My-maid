import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAddressDto) {
    // Validate Service Area
    const serviceArea = await this.prisma.serviceArea.findFirst({
      where: {
        id: dto.serviceAreaId,
        isActive: true,
      },
    });

    if (!serviceArea) {
      throw new BadRequestException('Service area is not available');
    }

    // Check duplicate
    const existing = await this.prisma.address.findFirst({
      where: {
        userId,
        houseNumber: dto.houseNumber,
        addressLine1: dto.addressLine1,
        pincode: dto.pincode,
      },
    });

    if (existing) {
      throw new ConflictException('Address already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.create({
        data: {
          ...dto,
          userId,
        },
      });
    });
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: {
        userId,
      },
      include: {
        city: true,
        serviceArea: true,
      },
      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findOne(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
      include: {
        city: true,
        serviceArea: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.serviceAreaId) {
      const area = await this.prisma.serviceArea.findFirst({
        where: {
          id: dto.serviceAreaId,
          isActive: true,
        },
      });

      if (!area) {
        throw new BadRequestException(
          'Service area is not available',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.update({
        where: {
          id: addressId,
        },
        data: dto,
      });
    });
  }

  async remove(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return {
      message: 'Address deleted successfully',
    };
  }

  async setDefault(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      return tx.address.update({
        where: {
          id: addressId,
        },
        data: {
          isDefault: true,
        },
      });
    });
  }
}