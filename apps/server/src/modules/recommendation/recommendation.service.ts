import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RecommendationService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

//     const categories =
//         await this.prisma.serviceCategory.findMany({
//             where: {
//                 isActive: true,
//             },
//             orderBy: {
//                 name: 'asc',
//             },
//         });

//     const popularServices =
//         await this.prisma.service.findMany({
//             where: {
//                 isActive: true,
//             },
//             take: 10,
//         });

//     const recentBookings =
//         await this.prisma.booking.findMany({
//             where: {
//                 userId,
//             },
//             take: 5,
//             orderBy: {
//                 createdAt: 'desc',
//             },
//             include: {
//                 service: true,
//             },
//         });

//     const offers =
//         await this.prisma.offer.findMany({
//             where: {
//                 isActive: true,
//             },
//             take: 5,
//         });

//   return {
//     categories,
//     popularServices,
//     recentBookings,
//     nearbyServices,
//     offers,
// };
}