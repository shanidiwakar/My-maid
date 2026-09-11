import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Address, BookingStatus, Prisma, Service, NotificationType, NotificationAudience, PartnerAvailability } from '@prisma/client';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) { }

  async create(userId: string, dto: CreateBookingDto) {
    const service =
      await this.validateService(dto.serviceId);

    const address =
      await this.validateAddress(
        userId,
        dto.addressId,
      );

    const bookingNumber =
      await this.generateBookingNumber();

    const pricing =
      this.calculatePricing(
        service,
        dto.quantity,
      );

    return this.createBooking({
      userId,
      dto,
      service,
      address,
      bookingNumber,
      pricing,
    });
  }

  private async validateService(
    serviceId: string,
  ): Promise<Service> {
    const service = await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    if (!service.isActive) {
      throw new NotFoundException(
        'Service is not available',
      );
    }

    return service;
  }

  private async validateAddress(
    userId: string,
    addressId: string,
  ) {
    const address = await this.prisma.address.findUnique({
      where: {
        id: addressId,
      },
      include: {
        city: true,
        serviceArea: true,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'Address not found',
      );
    }

    if (address.userId !== userId) {
      throw new ForbiddenException(
        'You cannot use this address',
      );
    }

    return address;
  }

  private async generateBookingNumber(): Promise<string> {
    const today = new Date();

    const date =
      today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const latestBooking =
      await this.prisma.booking.findFirst({
        where: {
          bookingNumber: {
            startsWith: `MM${date}`,
          },
        },
        orderBy: {
          bookingNumber: 'desc',
        },
      });

    let sequence = 1;

    if (latestBooking) {
      sequence =
        Number(
          latestBooking.bookingNumber.slice(-4),
        ) + 1;
    }

    return `MM${date}${String(sequence).padStart(
      4,
      '0',
    )}`;
  }

  private calculatePricing(
    service: Service,
    quantity: number,
  ): {
    unitPrice: number;
    totalPrice: number;
    discount: number;
    finalAmount: number;
  } {
    const unitPrice = Number(service.basePrice);

    const totalPrice = unitPrice * quantity;

    const discount = 0;

    const finalAmount = totalPrice - discount;

    return {
      unitPrice,
      totalPrice,
      discount,
      finalAmount,
    };
  }

  private async createBooking({
    userId,
    dto,
    service,
    address,
    bookingNumber,
    pricing,
  }: any) {
    return this.prisma.$transaction(
      async (tx) => {
        const booking =
          await tx.booking.create({
            data: {
              bookingNumber,

              userId,

              serviceId: service.id,

              addressId: address.id,

              bookingDate:
                new Date(dto.bookingDate),

              slotStart:
                new Date(dto.slotStart),

              slotEnd:
                new Date(dto.slotEnd),

              quantity: dto.quantity,

              // Service Snapshot
              serviceName: service.name,
              serviceDuration:
                service.duration,
              unitPrice:
                pricing.unitPrice,

              // Pricing
              totalPrice:
                pricing.totalPrice,
              discount:
                pricing.discount,
              finalAmount:
                pricing.finalAmount,

              // Address Snapshot
              houseNumber:
                address.houseNumber,
              buildingName:
                address.buildingName,
              addressLine1:
                address.addressLine1,
              addressLine2:
                address.addressLine2,
              landmark:
                address.landmark,
              cityName:
                address.city.name,
              serviceAreaName:
                address.serviceArea.name,
              pincode:
                address.pincode,

              latitude:
                address.latitude,
              longitude:
                address.longitude,

              notes: dto.notes,
            },
          });

        await this.notificationService.create({
          userId,

          type: NotificationType.BOOKING_CREATED,

          audience:
            NotificationAudience.CUSTOMER,

          title: 'Booking created',

          message:
            `Your booking ${booking.bookingNumber} has been created successfully.`,

          bookingId: booking.id,

          tx,
        });

        return booking;
      },
    );
  }

  async getBookings(
    userId: string,
    query: BookingQueryDto,
  ) {
    const {
      page = 1,
      limit = 10,
      status,
    } = query;

    const where: Prisma.BookingWhereInput = {
      userId,
      ...(status && { status }),
    };

    const skip = (page - 1) * limit;

    const [bookings, total] =
      await Promise.all([
        this.prisma.booking.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,

          select: {
            id: true,
            bookingNumber: true,
            serviceName: true,
            bookingDate: true,
            status: true,
            finalAmount: true,
            createdAt: true,

            partner: {
              select: {
                id: true,
                rating: true,

                user: {
                  select: {
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),

        this.prisma.booking.count({
          where,
        }),
      ]);

    return {
      data: bookings.map((booking) => ({
        ...booking,

        partner: booking.partner
          ? {
            id: booking.partner.id,

            name: [
              booking.partner.user.profile?.firstName,
              booking.partner.user.profile?.lastName,
            ]
              .filter(Boolean)
              .join(' '),

            avatar:
              booking.partner.user.profile?.avatar ?? null,

            rating: booking.partner.rating,
          }
          : null,
      })),

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBooking(
    userId: string,
    bookingId: string,
  ) {
    const booking =
      await this.prisma.booking.findUnique({
        where: {
          id: bookingId,
        },

        select: {
          id: true,
          bookingNumber: true,
          serviceName: true,
          serviceDuration: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          discount: true,
          finalAmount: true,
          bookingDate: true,
          slotStart: true,
          slotEnd: true,
          status: true,
          notes: true,

          houseNumber: true,
          buildingName: true,
          addressLine1: true,
          addressLine2: true,
          landmark: true,
          cityName: true,
          serviceAreaName: true,
          pincode: true,

          createdAt: true,

          userId: true,

          // Assigned partner
          partner: {
            select: {
              id: true,
              rating: true,
              totalJobs: true,

              user: {
                select: {
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!booking) {
      throw new NotFoundException(
        'Booking not found',
      );
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this booking',
      );
    }

    return {
      ...booking,

      partner: booking.partner
        ? {
          id: booking.partner.id,

          name: [
            booking.partner.user.profile
              ?.firstName,
            booking.partner.user.profile
              ?.lastName,
          ]
            .filter(Boolean)
            .join(' '),

          avatar:
            booking.partner.user.profile
              ?.avatar ?? null,

          rating: booking.partner.rating,
        }
        : null,
    };
  };

  async cancelBooking(
    userId: string,
    bookingId: string,
    dto: CancelBookingDto,
  ) {
    const booking =
      await this.prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        select: {
          id: true,
          bookingNumber: true,
          userId: true,
          partnerId: true,
          status: true,
        },
      });

    if (!booking) {
      throw new NotFoundException(
        'Booking not found',
      );
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this booking',
      );
    }

    const cancellableStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
    ];

    if (
      !cancellableStatuses.includes(
        booking.status,
      )
    ) {
      throw new BadRequestException(
        'Booking cannot be cancelled at this stage',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const result =
          await tx.booking.updateMany({
            where: {
              id: bookingId,
              userId,
              status: {
                in: cancellableStatuses,
              },
            },
            data: {
              status:
                BookingStatus.CANCELLED,
              cancelledReason:
                dto.reason,
            },
          });

        if (result.count !== 1) {
          throw new BadRequestException(
            'Booking could not be cancelled',
          );
        }

        if (booking.partnerId) {
          const partner =
            await tx.partner.findUnique({
              where: {
                id: booking.partnerId,
              },
              select: {
                id: true,
                userId: true,
              },
            });

          if (partner) {
            await tx.partner.update({
              where: {
                id: partner.id,
              },
              data: {
                availability:
                  PartnerAvailability.AVAILABLE,
              },
            });

            await this.notificationService.create({
              userId:
                partner.userId,

              type:
                NotificationType.BOOKING_CANCELLED,

              audience:
                NotificationAudience.PARTNER,

              title:
                'Booking cancelled',

              message:
                `Booking ${booking.bookingNumber} has been cancelled by the customer.`,

              bookingId:
                booking.id,

              tx,
            });
          }
        }

        await this.notificationService.create({
          userId,

          type:
            NotificationType.BOOKING_CANCELLED,

          audience:
            NotificationAudience.CUSTOMER,

          title:
            'Booking cancelled',

          message:
            `Your booking ${booking.bookingNumber} has been cancelled successfully.`,

          bookingId:
            booking.id,

          tx,
        });

        return tx.booking.findUnique({
          where: {
            id: bookingId,
          },
        });
      },
    );
  }

  private async transitionBooking(
    bookingId: string,
    from: BookingStatus,
    to: BookingStatus,
    tx: Prisma.TransactionClient,
  ) {
    const result = await tx.booking.updateMany({
      where: {
        id: bookingId,
        status: from,
      },
      data: {
        status: to,
      },
    });

    if (result.count !== 1) {
      throw new BadRequestException(
        `Booking cannot move from ${from} to ${to}`,
      );
    }

    return tx.booking.findUnique({
      where: {
        id: bookingId,
      },
    });
  }
}
