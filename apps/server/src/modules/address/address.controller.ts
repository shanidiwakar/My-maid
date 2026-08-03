import { Controller, Body, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressService } from './address.service';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';

@ApiTags('Address')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.addressService.findAll(user.sub);
  }
}