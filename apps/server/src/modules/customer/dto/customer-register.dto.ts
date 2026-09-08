import { IsOptional, IsString } from 'class-validator';

export class CustomerRegisterDto {
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}