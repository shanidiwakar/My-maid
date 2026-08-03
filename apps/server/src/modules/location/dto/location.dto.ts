import { IsString } from 'class-validator';

export class LocationDto {
  @IsString()
  cityId: string;
}