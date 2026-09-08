import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class DevLoginDto {
  @ApiProperty({
    example: '9999999002',
    description:
      'Development user phone number',
  })
  @IsString()
  @IsPhoneNumber('IN')
  phone: string;
}