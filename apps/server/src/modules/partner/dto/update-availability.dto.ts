import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PartnerAvailability } from '@prisma/client';

export class UpdateAvailabilityDto {
  @ApiProperty({
    enum: PartnerAvailability,
    example: PartnerAvailability.AVAILABLE,
  })
  @IsEnum(PartnerAvailability)
  availability: PartnerAvailability;
}