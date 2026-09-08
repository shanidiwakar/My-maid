import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

import { AdminService } from './admin.service';
import { AssignPartnerDto } from './dto/assign-partner.dto';
import { UpdatePartnerStatusDto } from './dto/update-partner-status.dto';
import { PartnerQueryDto } from './dto/partner-query.dto';
import { BookingQueryDto } from '../booking/dto/booking-query.dto';
import { NearbyPartnerQueryDto } from './dto/nearby-partner-query.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  @Get('partners')
  getPartners(
    @Query() query: PartnerQueryDto,
  ) {
    return this.adminService.getPartners(query);
  }

  @Get('partners/:id')
  getPartner(
    @Param('id') partnerId: string,
  ) {
    return this.adminService.getPartner(partnerId);
  }

  @Patch('partners/:id/status')
  @ApiMessage('Partner status updated successfully')
  updatePartnerStatus(
    @Param('id') partnerId: string,
    @Body() dto: UpdatePartnerStatusDto,
  ) {
    return this.adminService.updatePartnerStatus(
      partnerId,
      dto,
    );
  }

  @Get('bookings')
  getBookings(
    @Query() query: BookingQueryDto,
  ) {
    return this.adminService.getBookings(query);
  }

  @Get('bookings/:id/nearby-partners')
  getNearbyPartners(
    @Param('id') bookingId: string,
    @Query() query: NearbyPartnerQueryDto,
  ) {
    return this.adminService.getNearbyPartners(
      bookingId,
      query
    );
  }

  @Get('bookings/:id')
  getBooking(
    @Param('id') bookingId: string,
  ) {
    return this.adminService.getBooking(
      bookingId,
    );
  }


  @Patch('bookings/:id/assign-partner')
  @ApiMessage('Partner assigned successfully')
  assignPartner(
    @Param('id') bookingId: string,
    @Body() dto: AssignPartnerDto,
  ) {
    return this.adminService.assignPartner(
      bookingId,
      dto,
    );
  }

}