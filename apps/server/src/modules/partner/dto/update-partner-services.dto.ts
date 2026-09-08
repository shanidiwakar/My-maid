import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
} from 'class-validator';

export class UpdatePartnerServicesDto {
  @ApiProperty({
    type: [String],
    example: [
      'service-id-1',
      'service-id-2',
    ],
    description: 'Services provided by the partner',
  })
  @IsArray()
  @IsString({ each: true })
  serviceIds: string[];
}