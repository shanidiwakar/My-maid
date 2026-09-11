import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdatePartnerServicesDto } from './dto/update-partner-services.dto';
import { BookingStatus, NotificationAudience, NotificationType, PartnerAvailability, PartnerStatus, Prisma } from '@prisma/client';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { ApplyPartnerDto } from './dto/apply-partner.dto';
import { PartnerBookingQueryDto } from './dto/partner-booking-query.dto';
import { UpdatePartnerLocationDto } from './dto/update-partner-location.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PartnerService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) { }

    async updateAvailability(
        userId: string,
        dto: UpdateAvailabilityDto,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

        if (partner.status !== PartnerStatus.ACTIVE) {
            throw new BadRequestException(
                'Only active partners can change availability',
            );
        }

        if (
            dto.availability ===
            PartnerAvailability.BUSY
        ) {
            throw new BadRequestException(
                'BUSY status is managed by the booking system',
            );
        }

        const updatedPartner =
            await this.prisma.partner.update({
                where: {
                    id: partner.id,
                },
                data: {
                    availability: dto.availability,
                },
                select: {
                    id: true,
                    status: true,
                    availability: true,
                    isVerified: true,
                },
            });

        return updatedPartner;
    }

    async applyPartner(
        userId: string,
        dto: ApplyPartnerDto,
    ) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new NotFoundException(
                'User not found',
            );
        }

        const existingPartner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
            });

        if (existingPartner) {
            throw new BadRequestException(
                'Partner application already exists',
            );
        }

        const city = await this.prisma.city.findUnique({
            where: {
                id: dto.cityId,
            },
        });

        if (!city) {
            throw new NotFoundException(
                'City not found',
            );
        }

        const serviceArea =
            await this.prisma.serviceArea.findUnique({
                where: {
                    id: dto.serviceAreaId,
                },
            });

        if (!serviceArea) {
            throw new NotFoundException(
                'Service area not found',
            );
        }

        const partner =
            await this.prisma.partner.create({
                data: {
                    userId,
                    cityId: dto.cityId,
                    serviceAreaId: dto.serviceAreaId,
                    experience: dto.experience,

                    status: PartnerStatus.PENDING,

                    availability:
                        PartnerAvailability.OFFLINE,

                    isVerified: false,
                },
            });

        return partner;
    }

    async updateServices(
        userId: string,
        dto: UpdatePartnerServicesDto,
    ) {
        const partner = await this.prisma.partner.findUnique({
            where: {
                userId,
            },
        });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

        if (partner.status !== PartnerStatus.ACTIVE) {
            throw new BadRequestException(
                'Only active partners can manage services',
            );
        }

        const count = await this.prisma.service.count({
            where: {
                id: {
                    in: dto.serviceIds,
                },
                isActive: true,
            },
        });

        if (count !== dto.serviceIds.length) {
            throw new BadRequestException(
                'One or more selected services are invalid',
            );
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.partnerService.deleteMany({
                where: {
                    partnerId: partner.id,
                },
            });

            await tx.partnerService.createMany({
                data: dto.serviceIds.map((serviceId) => ({
                    partnerId: partner.id,
                    serviceId,
                })),
            });

            return tx.partner.findUnique({
                where: {
                    id: partner.id,
                },
                include: {
                    partnerServices: {
                        include: {
                            service: true,
                        },
                    },
                },
            });
        });
    }

    async getBookings(
        userId: string,
        query: PartnerBookingQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            status,
        } = query;

        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

        const where: Prisma.BookingWhereInput = {
            partnerId: partner.id,
            ...(status && {
                status,
            }),
        };

        const [data, total] =
            await this.prisma.$transaction([
                this.prisma.booking.findMany({
                    where,

                    orderBy: {
                        bookingDate: 'desc',
                    },

                    skip: (page - 1) * limit,
                    take: limit,

                    select: {
                        id: true,
                        bookingNumber: true,
                        serviceName: true,
                        serviceDuration: true,
                        quantity: true,
                        bookingDate: true,
                        slotStart: true,
                        slotEnd: true,
                        finalAmount: true,
                        status: true,

                        houseNumber: true,
                        buildingName: true,
                        addressLine1: true,
                        addressLine2: true,
                        landmark: true,
                        cityName: true,
                        serviceAreaName: true,
                        pincode: true,

                        user: {
                            select: {
                                id: true,
                                phone: true,

                                profile: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
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
            data: data.map((booking) => ({
                id: booking.id,
                bookingNumber: booking.bookingNumber,
                serviceName: booking.serviceName,
                serviceDuration:
                    booking.serviceDuration,
                quantity: booking.quantity,

                bookingDate: booking.bookingDate,
                slotStart: booking.slotStart,
                slotEnd: booking.slotEnd,

                finalAmount: booking.finalAmount,
                status: booking.status,

                customer: {
                    id: booking.user.id,

                    name: [
                        booking.user.profile?.firstName,
                        booking.user.profile?.lastName,
                    ]
                        .filter(Boolean)
                        .join(' '),

                    phone: booking.user.phone,
                },

                address: {
                    houseNumber: booking.houseNumber,
                    buildingName:
                        booking.buildingName,
                    addressLine1:
                        booking.addressLine1,
                    addressLine2:
                        booking.addressLine2,
                    landmark: booking.landmark,
                    cityName: booking.cityName,
                    serviceAreaName:
                        booking.serviceAreaName,
                    pincode: booking.pincode,
                },
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
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

        const booking =
            await this.prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },

                select: {
                    id: true,
                    bookingNumber: true,

                    serviceId: true,
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
                    cancelledReason: true,
                    completedAt: true,

                    houseNumber: true,
                    buildingName: true,
                    addressLine1: true,
                    addressLine2: true,
                    landmark: true,
                    cityName: true,
                    serviceAreaName: true,
                    pincode: true,

                    partnerId: true,

                    createdAt: true,
                    updatedAt: true,

                    user: {
                        select: {
                            id: true,
                            phone: true,

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
            });

        if (!booking) {
            throw new NotFoundException(
                'Booking not found',
            );
        }

        if (booking.partnerId !== partner.id) {
            throw new ForbiddenException(
                'You are not authorized to view this booking',
            );
        }

        return {
            id: booking.id,
            bookingNumber: booking.bookingNumber,

            service: {
                id: booking.serviceId,
                name: booking.serviceName,
                duration: booking.serviceDuration,
                quantity: booking.quantity,
            },

            pricing: {
                unitPrice: booking.unitPrice,
                totalPrice: booking.totalPrice,
                discount: booking.discount,
                finalAmount: booking.finalAmount,
            },

            schedule: {
                bookingDate: booking.bookingDate,
                slotStart: booking.slotStart,
                slotEnd: booking.slotEnd,
            },

            status: booking.status,
            notes: booking.notes,
            cancelledReason: booking.cancelledReason,
            completedAt: booking.completedAt,

            customer: {
                id: booking.user.id,
                phone: booking.user.phone,

                name: [
                    booking.user.profile?.firstName,
                    booking.user.profile?.lastName,
                ]
                    .filter(Boolean)
                    .join(' '),

                avatar:
                    booking.user.profile?.avatar ?? null,
            },

            address: {
                houseNumber: booking.houseNumber,
                buildingName: booking.buildingName,
                addressLine1: booking.addressLine1,
                addressLine2: booking.addressLine2,
                landmark: booking.landmark,
                cityName: booking.cityName,
                serviceAreaName:
                    booking.serviceAreaName,
                pincode: booking.pincode,
            },

            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    }

    async acceptBooking(
        userId: string,
        bookingId: string,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

        const booking =
            await this.prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },
                select: {
                    id: true,
                    partnerId: true,
                    status: true,
                },
            });

        if (!booking) {
            throw new NotFoundException(
                'Booking not found',
            );
        }

        if (booking.partnerId !== partner.id) {
            throw new ForbiddenException(
                'You are not assigned to this booking',
            );
        }

        return this.prisma.$transaction(
            async (tx) => {
                const result =
                    await tx.booking.updateMany({
                        where: {
                            id: bookingId,
                            partnerId: partner.id,
                            status: BookingStatus.PARTNER_ASSIGNED,
                        },
                        data: {
                            status: BookingStatus.CONFIRMED,
                        },
                    });

                if (result.count !== 1) {
                    throw new BadRequestException(
                        'Booking is no longer available for acceptance',
                    );
                }

                return tx.booking.findUnique({
                    where: {
                        id: bookingId,
                    },
                });
            },
        );
    }

    async rejectBooking(
        userId: string,
        bookingId: string,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

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

        if (booking.partnerId !== partner.id) {
            throw new ForbiddenException(
                'You are not assigned to this booking',
            );
        }

        if (
            booking.status !==
            BookingStatus.PARTNER_ASSIGNED
        ) {
            throw new BadRequestException(
                `Booking cannot be rejected when status is ${booking.status}`,
            );
        }

        return this.prisma.$transaction(
            async (tx) => {
                const result =
                    await tx.booking.updateMany({
                        where: {
                            id: bookingId,
                            partnerId: partner.id,
                            status:
                                BookingStatus.PARTNER_ASSIGNED,
                        },
                        data: {
                            partnerId: null,
                            status:
                                BookingStatus.PENDING,
                        },
                    });

                if (result.count !== 1) {
                    throw new BadRequestException(
                        'Booking is no longer available for rejection',
                    );
                }

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
                    userId: booking.userId,

                    type:
                        NotificationType.BOOKING_REJECTED,

                    audience:
                        NotificationAudience.CUSTOMER,

                    title:
                        'Partner unavailable',

                    message:
                        `The assigned partner could not accept booking ${booking.bookingNumber}. We will assign another partner.`,

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

    async partnerArriving(
        userId: string,
        bookingId: string,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

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

        if (booking.partnerId !== partner.id) {
            throw new ForbiddenException(
                'You are not assigned to this booking',
            );
        }

        return this.prisma.$transaction(
            async (tx) => {
                const result =
                    await tx.booking.updateMany({
                        where: {
                            id: bookingId,
                            partnerId: partner.id,
                            status:
                                BookingStatus.PARTNER_ASSIGNED,
                        },
                        data: {
                            status:
                                BookingStatus.PARTNER_ARRIVING,
                        },
                    });

                if (result.count !== 1) {
                    throw new BadRequestException(
                        'Booking cannot be marked as arriving',
                    );
                }

                await this.notificationService.create({
                    userId: booking.userId,

                    type:
                        NotificationType.PARTNER_ARRIVING,

                    audience:
                        NotificationAudience.CUSTOMER,

                    title:
                        'Partner is on the way',

                    message:
                        `Your partner is on the way for booking ${booking.bookingNumber}.`,

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

    async startBooking(
        userId: string,
        bookingId: string,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

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

        if (booking.partnerId !== partner.id) {
            throw new ForbiddenException(
                'You are not assigned to this booking',
            );
        }

        return this.prisma.$transaction(
            async (tx) => {
                const result =
                    await tx.booking.updateMany({
                        where: {
                            id: bookingId,
                            partnerId: partner.id,
                            status:
                                BookingStatus.PARTNER_ARRIVING,
                        },
                        data: {
                            status:
                                BookingStatus.IN_PROGRESS,
                        },
                    });

                if (result.count !== 1) {
                    throw new BadRequestException(
                        'Booking cannot be started',
                    );
                }

                await this.notificationService.create({
                    userId: booking.userId,

                    type:
                        NotificationType.BOOKING_STARTED,

                    audience:
                        NotificationAudience.CUSTOMER,

                    title:
                        'Service started',

                    message:
                        `Service has started for booking ${booking.bookingNumber}.`,

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

    async completeBooking(
        userId: string,
        bookingId: string,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

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

        if (booking.partnerId !== partner.id) {
            throw new ForbiddenException(
                'You are not assigned to this booking',
            );
        }

        return this.prisma.$transaction(
            async (tx) => {
                const result =
                    await tx.booking.updateMany({
                        where: {
                            id: bookingId,
                            partnerId: partner.id,
                            status:
                                BookingStatus.IN_PROGRESS,
                        },
                        data: {
                            status:
                                BookingStatus.COMPLETED,
                            completedAt: new Date(),
                        },
                    });

                if (result.count !== 1) {
                    throw new BadRequestException(
                        'Booking cannot be completed',
                    );
                }

                await tx.partner.update({
                    where: {
                        id: partner.id,
                    },
                    data: {
                        availability:
                            PartnerAvailability.AVAILABLE,
                        totalJobs: {
                            increment: 1,
                        },
                    },
                });

                await this.notificationService.create({
                    userId: booking.userId,

                    type:
                        NotificationType.BOOKING_COMPLETED,

                    audience:
                        NotificationAudience.CUSTOMER,

                    title:
                        'Service completed',

                    message:
                        `Your service for booking ${booking.bookingNumber} has been completed.`,

                    bookingId:
                        booking.id,

                    tx,
                });

                return tx.booking.findUnique({
                    where: {
                        id: bookingId,
                    },
                    include: {
                        partner: true,
                        service: true,
                    },
                });
            },
        );
    }

    async updateLocation(
        userId: string,
        dto: UpdatePartnerLocationDto,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    userId,
                },
                select: {
                    id: true,
                    status: true,
                    availability: true,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner profile not found',
            );
        }

        if (partner.status !== PartnerStatus.ACTIVE) {
            throw new BadRequestException(
                'Only active partners can update location',
            );
        }

        if (
            partner.availability ===
            PartnerAvailability.OFFLINE
        ) {
            throw new BadRequestException(
                'Offline partner cannot update location',
            );
        }

        return this.prisma.partner.update({
            where: {
                id: partner.id,
            },

            data: {
                latitude: dto.latitude,
                longitude: dto.longitude,
                locationUpdatedAt: new Date(),
            },

            select: {
                id: true,
                latitude: true,
                longitude: true,
                locationUpdatedAt: true,
            },
        });
    }
}
