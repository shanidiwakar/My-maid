import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class ApplyPartnerDto {
  @ApiProperty({
    example: 'city-id',
    description: 'City where partner wants to work',
  })
  @IsString()
  cityId: string;

  @ApiProperty({
    example: 'service-area-id',
    description: 'Service area where partner wants to work',
  })
  @IsString()
  serviceAreaId: string;

  @ApiProperty({
    example: 3,
    description: 'Years of experience',
  })
  @IsInt()
  @Min(0)
  experience: number;
}