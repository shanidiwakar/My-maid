import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

import { PartnerService } from './partner.service';
import { UpdatePartnerServicesDto } from './dto/update-partner-services.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { ApplyPartnerDto } from './dto/apply-partner.dto';
import { PartnerActiveGuard } from './guards/partner-active.guard';
import { PartnerBookingQueryDto } from './dto/partner-booking-query.dto';
import { UpdatePartnerLocationDto } from './dto/update-partner-location.dto';

@ApiTags('Partner')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('partners')
export class PartnerController {
    constructor(
        private readonly partnerService: PartnerService,
    ) { }

    @Patch('availability')
    @UseGuards(PartnerActiveGuard)
    updateAvailability(
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateAvailabilityDto,
    ) {
        return this.partnerService.updateAvailability(
            user.sub,
            dto,
        );
    }

    @Post('apply')
    applyPartner(
        @CurrentUser() user: JwtPayload,
        @Body() dto: ApplyPartnerDto,
    ) {
        return this.partnerService.applyPartner(
            user.sub,
            dto,
        );
    }

    @Post('services')
    @UseGuards(PartnerActiveGuard)
    @ApiMessage('Partner services updated successfully')
    updateServices(
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdatePartnerServicesDto,
    ) {
        return this.partnerService.updateServices(
            user.sub,
            dto,
        );
    }

    @Get('bookings')
    getBookings(
        @CurrentUser() user: JwtPayload,
        @Query() query: PartnerBookingQueryDto,
    ) {
        return this.partnerService.getBookings(
            user.sub,
            query,
        );
    }

    @Get('bookings/:bookingId')
    getBooking(
        @CurrentUser() user: JwtPayload,
        @Param('bookingId') bookingId: string,
    ) {
        return this.partnerService.getBooking(
            user.sub,
            bookingId,
        );
    }

    @Patch('bookings/:bookingId/accept')
    @UseGuards(PartnerActiveGuard)
    @ApiMessage('Booking accepted successfully')
    acceptBooking(
        @CurrentUser() user: JwtPayload,
        @Param('bookingId') bookingId: string,
    ) {
        return this.partnerService.acceptBooking(
            user.sub,
            bookingId,
        );
    }

    @Patch('bookings/:bookingId/reject')
    @UseGuards(PartnerActiveGuard)
    @ApiMessage('Booking rejected successfully')
    rejectBooking(
        @CurrentUser() user: JwtPayload,
        @Param('bookingId') bookingId: string,
    ) {
        return this.partnerService.rejectBooking(
            user.sub,
            bookingId,
        );
    }

    @Patch('bookings/:bookingId/arriving')
    @UseGuards(PartnerActiveGuard)
    @ApiMessage('Partner is arriving')
    partnerArriving(
        @CurrentUser() user: JwtPayload,
        @Param('bookingId') bookingId: string,
    ) {
        return this.partnerService.partnerArriving(
            user.sub,
            bookingId,
        );
    }

    @Patch('bookings/:bookingId/start')
    @UseGuards(PartnerActiveGuard)
    @ApiMessage('Booking started successfully')
    startBooking(
        @CurrentUser() user: JwtPayload,
        @Param('bookingId') bookingId: string,
    ) {
        return this.partnerService.startBooking(
            user.sub,
            bookingId,
        );
    }

    @Patch('bookings/:bookingId/complete')
    @UseGuards(PartnerActiveGuard)
    @ApiMessage('Booking completed successfully')
    completeBooking(
        @CurrentUser() user: JwtPayload,
        @Param('bookingId') bookingId: string,
    ) {
        return this.partnerService.completeBooking(
            user.sub,
            bookingId,
        );
    }

    @Patch('location')
    @ApiMessage('Partner location updated successfully')
    updateLocation(
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdatePartnerLocationDto,
    ) {
        return this.partnerService.updateLocation(
            user.sub,
            dto,
        );
    }
}