import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DevicePlatform,
  NotificationAudience,
} from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({
    example: 'fcm-device-token...',
  })
  @IsString()
  @MaxLength(2048)
  token: string;

  @ApiProperty({
    enum: DevicePlatform,
  })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @ApiProperty({
    enum: NotificationAudience,
  })
  @IsEnum(NotificationAudience)
  audience: NotificationAudience;

  @ApiPropertyOptional({
    example: 'iphone-15-device-id',
  })
  @IsString()
  @IsOptional()
  deviceId?: string;
}