import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class DeactivateDeviceTokenDto {
  @ApiProperty({
    example: 'fcm-device-token...',
  })
  @IsString()
  @MaxLength(2048)
  token: string;
}