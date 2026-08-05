import {
  IsEnum,
  IsOptional,
} from 'class-validator';
import { BookingStatus } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class BookingQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}