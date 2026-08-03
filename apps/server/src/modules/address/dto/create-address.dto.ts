import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';
import { AddressType } from '@prisma/client';

export class CreateAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  houseNumber: string;

  @IsOptional()
  @IsString()
  buildingName?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  pincode: string;

  @IsString()
  cityId: string;

  @IsString()
  serviceAreaId: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}