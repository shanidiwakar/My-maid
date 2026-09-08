import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class NearbyPartnerQueryDto {
  @ApiPropertyOptional({
    example: 5,
    default: 5,
    description:
      'Search radius in kilometers',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  radiusKm: number = 5;
}