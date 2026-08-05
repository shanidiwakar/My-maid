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
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) { }

  @Post()
  @ApiMessage('Booking created successfully')
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.create(
      user.sub,
      dto,
    );
  }

  @Get()
  @ApiMessage('Bookings fetched successfully')
  getBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: BookingQueryDto,
  ) {
    return this.bookingService.getBookings(
      user.sub,
      query,
    );
  }

  @Get(':id')
  @ApiMessage('Booking fetched successfully')
  getBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bookingService.getBooking(
      user.sub,
      id,
    );
  }

  @Patch(':id/cancel')
  @ApiMessage('Booking cancelled successfully')
  cancelBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingService.cancelBooking(
      user.sub,
      id,
      dto,
    );
  }
}