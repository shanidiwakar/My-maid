import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ServiceQueryDto } from './dto/service-query.dto';
import { paginate } from 'src/common/utils/pagination.util';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from 'src/common/constants/pagination';

@Injectable()
export class ServiceService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getCategories() {
        return this.prisma.serviceCategory.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    }

    async getServices(query: ServiceQueryDto) {
        const {
            page = 1,
            limit = 10,
            categoryId,
        } = query;

        const where = {
            isActive: true,
            ...(categoryId && { categoryId }),
        };

        return paginate(this.prisma.service, {
            page,
            limit,
            where,
            include: {
                category: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async getService(id: string) {
        const service =
            await this.prisma.service.findUnique({
                where: {
                    id,
                },
                include: {
                    category: true,
                },
            });

        if (!service) {
            throw new NotFoundException(
                'Service not found',
            );
        }

        return service;
    }
}