import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PartnerService } from '../partner/partner.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PartnerService, PrismaService]
})
export class AdminModule {}
