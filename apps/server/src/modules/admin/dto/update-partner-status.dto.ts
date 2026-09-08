import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PartnerStatus } from '@prisma/client';

export class UpdatePartnerStatusDto {
  @ApiProperty({
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
  })
  @IsEnum(PartnerStatus)
  status: PartnerStatus;
}