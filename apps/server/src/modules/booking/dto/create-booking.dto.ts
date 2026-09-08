import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'cmxxxxxxxxxxxxxxxxx',
    description: 'Service ID',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    example: 'cmxxxxxxxxxxxxxxxxx',
    description: 'Customer address ID',
  })
  @IsString()
  addressId: string;

  @ApiProperty({
    example: '2026-08-20',
    description: 'Date of the booking',
  })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({
    example: '2026-08-20T10:00:00.000Z',
    description: 'Booking slot start time',
  })
  @IsDateString()
  slotStart: string;

  @ApiProperty({
    example: '2026-08-20T13:00:00.000Z',
    description: 'Booking slot end time',
  })
  @IsDateString()
  slotEnd: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    maximum: 10,
    description: 'Number of services',
  })
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @ApiPropertyOptional({
    example: 'Please call before arriving',
    description: 'Optional booking notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}