import { IsString } from 'class-validator';

export class AssignPartnerDto {
  @IsString()
  partnerId: string;
}