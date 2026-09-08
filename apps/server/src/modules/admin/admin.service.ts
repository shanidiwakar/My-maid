import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AssignPartnerDto } from './dto/assign-partner.dto';
import { BookingStatus, PartnerStatus, PartnerAvailability, } from '.prisma/client/default';
import { UpdatePartnerStatusDto } from './dto/update-partner-status.dto';
import { PartnerQueryDto } from './dto/partner-query.dto';
import { AdminBookingQueryDto } from './dto/admin-booking-query.dto';
import { NearbyPartnerQueryDto } from './dto/nearby-partner-query.dto';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getPartners(query: PartnerQueryDto) {
        const {
            page = 1,
            limit = 10,
            status,
            cityId,
            serviceAreaId,
        } = query;

        const where = {
            ...(status && {
                status,
            }),

            ...(cityId && {
                cityId,
            }),

            ...(serviceAreaId && {
                serviceAreaId,
            }),
        };

        const [data, total] =
            await this.prisma.$transaction([
                this.prisma.partner.findMany({
                    where,

                    orderBy: {
                        createdAt: 'desc',
                    },

                    skip: (page - 1) * limit,
                    take: limit,

                    include: {
                        user: {
                            select: {
                                id: true,
                                phone: true,
                                status: true,
                                isVerified: true,
                            },
                        },

                        city: true,

                        serviceArea: true,

                        partnerServices: {
                            include: {
                                service: true,
                            },
                        },
                    },
                }),

                this.prisma.partner.count({
                    where,
                }),
            ]);

        return {
            data,

            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }

    async getPartner(partnerId: string) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    id: partnerId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            phone: true,
                            // email: true,
                            // fullName: true,
                            // profileImage: true,
                            status: true,
                            isVerified: true,
                        },
                    },
                    city: true,
                    serviceArea: true,
                    partnerServices: {
                        include: {
                            service: true,
                        },
                    },
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner not found',
            );
        }

        return partner;
    }

    async updatePartnerStatus(
        partnerId: string,
        dto: UpdatePartnerStatusDto,
    ) {
        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    id: partnerId,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner not found',
            );
        }

        // Same status
        if (partner.status === dto.status) {
            throw new BadRequestException(
                `Partner is already ${dto.status}`,
            );
        }

        // Validate status transitions
        if (
            partner.status === PartnerStatus.REJECTED &&
            dto.status === PartnerStatus.ACTIVE
        ) {
            throw new BadRequestException(
                'Rejected partner cannot be activated directly',
            );
        }

        if (
            partner.status === PartnerStatus.ACTIVE &&
            dto.status === PartnerStatus.REJECTED
        ) {
            throw new BadRequestException(
                'Active partner cannot be rejected directly',
            );
        }

        return this.prisma.$transaction(
            async (tx) => {
                const updatedPartner =
                    await tx.partner.update({
                        where: {
                            id: partnerId,
                        },
                        data: {
                            status: dto.status,

                            isVerified:
                                dto.status === PartnerStatus.ACTIVE,

                            // Suspended/rejected/active partners must be offline
                            ...(dto.status === PartnerStatus.SUSPENDED ||
                                dto.status === PartnerStatus.REJECTED ||
                                dto.status === PartnerStatus.ACTIVE
                                ? {
                                    availability:
                                        PartnerAvailability.OFFLINE,
                                }
                                : {}),
                        },
                    });

                return updatedPartner;
            },
        );
    }

    async getBookings(
        query: AdminBookingQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            status,
        } = query;

        const where = {
            ...(status && {
                status,
            }),
        };

        const [data, total] =
            await this.prisma.$transaction([
                this.prisma.booking.findMany({
                    where,

                    orderBy: {
                        createdAt: 'desc',
                    },

                    skip: (page - 1) * limit,
                    take: limit,

                    select: {
                        id: true,
                        bookingNumber: true,
                        serviceName: true,
                        bookingDate: true,
                        slotStart: true,
                        slotEnd: true,
                        finalAmount: true,
                        status: true,
                        createdAt: true,

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

                        partner: {
                            select: {
                                id: true,
                                rating: true,
                                availability: true,

                                user: {
                                    select: {
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
                bookingDate: booking.bookingDate,
                slotStart: booking.slotStart,
                slotEnd: booking.slotEnd,
                finalAmount: booking.finalAmount,
                status: booking.status,
                createdAt: booking.createdAt,

                customer: {
                    id: booking.user.id,
                    phone: booking.user.phone,
                    name: [
                        booking.user.profile?.firstName,
                        booking.user.profile?.lastName,
                    ]
                        .filter(Boolean)
                        .join(' '),
                },

                partner: booking.partner
                    ? {
                        id: booking.partner.id,
                        phone: booking.partner.user.phone,
                        name: [
                            booking.partner.user.profile?.firstName,
                            booking.partner.user.profile?.lastName,
                        ]
                            .filter(Boolean)
                            .join(' '),
                        rating: booking.partner.rating,
                        availability:
                            booking.partner.availability,
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

    async getNearbyPartners(
        bookingId: string,
        query: NearbyPartnerQueryDto,
    ) {
        const {
            radiusKm = 5,
        } = query;

        const booking =
            await this.prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },

                select: {
                    id: true,
                    serviceId: true,
                    status: true,
                    latitude: true,
                    longitude: true,
                },
            });

        if (!booking) {
            throw new NotFoundException(
                'Booking not found',
            );
        }

        if (
            booking.status !== BookingStatus.PENDING
        ) {
            throw new BadRequestException(
                `Nearby partners cannot be searched when booking is ${booking.status}`,
            );
        }

        if (
            booking.latitude === null ||
            booking.longitude === null
        ) {
            throw new BadRequestException(
                'Booking location is not available',
            );
        }

        const staleLocationCutoff = new Date(
            Date.now() - 5 * 60 * 1000,
        );

        const partners =
            await this.prisma.partner.findMany({
                where: {
                    status: PartnerStatus.ACTIVE,

                    availability:
                        PartnerAvailability.AVAILABLE,

                    latitude: {
                        not: null,
                    },

                    longitude: {
                        not: null,
                    },

                    locationUpdatedAt: {
                        gte: staleLocationCutoff,
                    },

                    partnerServices: {
                        some: {
                            serviceId: booking.serviceId,
                        },
                    },
                },

                select: {
                    id: true,
                    latitude: true,
                    longitude: true,
                    rating: true,
                    totalJobs: true,
                    experience: true,
                    locationUpdatedAt: true,

                    user: {
                        select: {
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

        const bookingLatitude =
            Number(booking.latitude);

        const bookingLongitude =
            Number(booking.longitude);

        const result = partners
            .map((partner) => {
                const partnerLatitude =
                    Number(partner.latitude);

                const partnerLongitude =
                    Number(partner.longitude);

                const distanceKm =
                    this.calculateDistanceKm(
                        bookingLatitude,
                        bookingLongitude,
                        partnerLatitude,
                        partnerLongitude,
                    );

                const rating =
                    Number(partner.rating ?? 0);

                const totalJobs =
                    partner.totalJobs ?? 0;

                const experience =
                    partner.experience ?? 0;

                /**
                 * Recommendation Score
                 *
                 * Lower distance = better
                 * Higher rating = better
                 * More completed jobs = better
                 * More experience = slightly better
                 */

                const distanceScore =
                    Math.max(
                        0,
                        100 - distanceKm * 10,
                    );

                const ratingScore =
                    rating * 20;

                const jobsScore =
                    Math.min(totalJobs, 100);

                const experienceScore =
                    Math.min(
                        experience * 5,
                        50,
                    );

                const recommendationScore =
                    distanceScore * 0.5 +
                    ratingScore * 0.3 +
                    jobsScore * 0.15 +
                    experienceScore * 0.05;

                return {
                    id: partner.id,

                    name: [
                        partner.user.profile?.firstName,
                        partner.user.profile?.lastName,
                    ]
                        .filter(Boolean)
                        .join(' '),

                    phone: partner.user.phone,

                    avatar:
                        partner.user.profile?.avatar ??
                        null,

                    rating: partner.rating,
                    totalJobs: partner.totalJobs,
                    experience: partner.experience,

                    latitude: partner.latitude,
                    longitude: partner.longitude,

                    locationUpdatedAt:
                        partner.locationUpdatedAt,

                    distanceKm:
                        Number(
                            distanceKm.toFixed(2),
                        ),

                    recommendationScore:
                        Number(
                            recommendationScore.toFixed(2),
                        ),
                };
            })

            .filter(
                (partner) =>
                    partner.distanceKm <= radiusKm,
            )

            .sort(
                (a, b) =>
                    b.recommendationScore -
                    a.recommendationScore,
            );

        const recommendedPartner =
            result.length > 0
                ? result[0]
                : null;

        return {
            bookingId: booking.id,

            searchRadiusKm: radiusKm,

            location: {
                latitude: booking.latitude,
                longitude: booking.longitude,
            },

            totalPartners: result.length,

            recommendedPartnerId:
                recommendedPartner?.id ?? null,

            partners: result.map(
                (partner, index) => ({
                    ...partner,
                    recommended: index === 0,
                }),
            ),
        };
    }

    async getBooking(
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

                    // Service
                    serviceId: true,
                    serviceName: true,
                    serviceDuration: true,
                    quantity: true,

                    // Pricing
                    unitPrice: true,
                    totalPrice: true,
                    discount: true,
                    finalAmount: true,

                    // Schedule
                    bookingDate: true,
                    slotStart: true,
                    slotEnd: true,

                    // Booking state
                    status: true,
                    notes: true,
                    cancelledReason: true,
                    completedAt: true,

                    // Address snapshot
                    houseNumber: true,
                    buildingName: true,
                    addressLine1: true,
                    addressLine2: true,
                    landmark: true,
                    cityName: true,
                    serviceAreaName: true,
                    pincode: true,

                    createdAt: true,
                    updatedAt: true,

                    // Customer
                    user: {
                        select: {
                            id: true,
                            phone: true,
                            status: true,
                            isVerified: true,

                            profile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    avatar: true,
                                },
                            },
                        },
                    },

                    // Assigned Partner
                    partner: {
                        select: {
                            id: true,
                            experience: true,
                            rating: true,
                            totalJobs: true,
                            status: true,
                            availability: true,

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
                    },
                },
            });

        if (!booking) {
            throw new NotFoundException(
                'Booking not found',
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
            cancelledReason:
                booking.cancelledReason,
            completedAt: booking.completedAt,

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

            customer: {
                id: booking.user.id,
                phone: booking.user.phone,

                name: [
                    booking.user.profile?.firstName,
                    booking.user.profile?.lastName,
                ]
                    .filter(Boolean)
                    .join(' '),

                email:
                    booking.user.profile?.email ?? null,

                avatar:
                    booking.user.profile?.avatar ?? null,

                status: booking.user.status,
                isVerified: booking.user.isVerified,
            },

            partner: booking.partner
                ? {
                    id: booking.partner.id,

                    userId:
                        booking.partner.user.id,

                    phone:
                        booking.partner.user.phone,

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

                    experience:
                        booking.partner.experience,

                    rating:
                        booking.partner.rating,

                    totalJobs:
                        booking.partner.totalJobs,

                    status:
                        booking.partner.status,

                    availability:
                        booking.partner.availability,
                }
                : null,

            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    }

    async assignPartner(
        bookingId: string,
        dto: AssignPartnerDto,
    ) {
        const booking =
            await this.prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },
            });

        if (!booking) {
            throw new NotFoundException(
                'Booking not found',
            );
        }

        const partner =
            await this.prisma.partner.findUnique({
                where: {
                    id: dto.partnerId,
                },
            });

        if (!partner) {
            throw new NotFoundException(
                'Partner not found',
            );
        }

        if (
            booking.status !== BookingStatus.PENDING
        ) {
            throw new BadRequestException(
                `Partner cannot be assigned when booking is ${booking.status}`,
            );
        }

        if (
            partner.status !== PartnerStatus.ACTIVE
        ) {
            throw new BadRequestException(
                'Partner is not active',
            );
        }

        if (
            partner.availability !==
            PartnerAvailability.AVAILABLE
        ) {
            throw new BadRequestException(
                'Partner is not available',
            );
        }

        const partnerService =
            await this.prisma.partnerService.findUnique({
                where: {
                    partnerId_serviceId: {
                        partnerId: partner.id,
                        serviceId: booking.serviceId,
                    },
                },
            });

        if (!partnerService) {
            throw new BadRequestException(
                'Partner does not provide this service',
            );
        }

        return this.assign(
            bookingId,
            dto.partnerId,
        );
    }

    private async assign(
        bookingId: string,
        partnerId: string,
    ) {
        return this.prisma.$transaction(
            async (tx) => {

                const booking =
                    await tx.booking.findUnique({
                        where: {
                            id: bookingId,
                        },
                    });

                if (!booking) {
                    throw new NotFoundException(
                        'Booking not found',
                    );
                }

                if (
                    booking.status !==
                    BookingStatus.PENDING
                ) {
                    throw new BadRequestException(
                        `Booking is already ${booking.status}`,
                    );
                }

                const partner =
                    await tx.partner.findUnique({
                        where: {
                            id: partnerId,
                        },
                    });

                if (!partner) {
                    throw new NotFoundException(
                        'Partner not found',
                    );
                }

                if (
                    partner.status !==
                    PartnerStatus.ACTIVE
                ) {
                    throw new BadRequestException(
                        'Partner is not active',
                    );
                }

                if (
                    partner.availability !==
                    PartnerAvailability.AVAILABLE
                ) {
                    throw new BadRequestException(
                        'Partner is not available',
                    );
                }

                const partnerService =
                    await tx.partnerService.findUnique({
                        where: {
                            partnerId_serviceId: {
                                partnerId,
                                serviceId:
                                    booking.serviceId,
                            },
                        },
                    });

                if (!partnerService) {
                    throw new BadRequestException(
                        'Partner does not provide this service',
                    );
                }

                // Atomic booking assignment
                const bookingResult =
                    await tx.booking.updateMany({
                        where: {
                            id: bookingId,
                            status:
                                BookingStatus.PENDING,
                            partnerId: null,
                        },
                        data: {
                            partnerId,
                            status:
                                BookingStatus.PARTNER_ASSIGNED,
                        },
                    });

                if (bookingResult.count !== 1) {
                    throw new BadRequestException(
                        'Booking is no longer available for assignment',
                    );
                }

                // Atomic partner locking
                const partnerResult =
                    await tx.partner.updateMany({
                        where: {
                            id: partnerId,
                            status:
                                PartnerStatus.ACTIVE,
                            availability:
                                PartnerAvailability.AVAILABLE,
                        },
                        data: {
                            availability:
                                PartnerAvailability.BUSY,
                        },
                    });

                if (partnerResult.count !== 1) {
                    throw new BadRequestException(
                        'Partner is no longer available',
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

    private calculateDistanceKm(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const earthRadiusKm = 6371;

        const toRadians = (
            value: number,
        ) => {
            return (value * Math.PI) / 180;
        };

        const latitudeDifference =
            toRadians(lat2 - lat1);

        const longitudeDifference =
            toRadians(lon2 - lon1);

        const a =
            Math.sin(
                latitudeDifference / 2,
            ) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(
                longitudeDifference / 2,
            ) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a),
            );

        return earthRadiusKm * c;
    }
}