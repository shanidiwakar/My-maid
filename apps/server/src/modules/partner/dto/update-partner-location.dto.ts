import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
} from 'class-validator';

export class UpdatePartnerLocationDto {
  @ApiProperty({
    example: 22.7196,
  })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    example: 75.8577,
  })
  @IsNumber()
  @IsLongitude()
  longitude: number;
}