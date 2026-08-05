import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  serviceId: string;

  @IsString()
  addressId: string;

  @IsDateString()
  bookingDate: string;

  @IsDateString()
  slotStart: string;

  @IsDateString()
  slotEnd: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}