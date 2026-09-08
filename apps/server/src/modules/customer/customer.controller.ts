import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CustomerService } from './customer.service';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  register(
    @Req() req: any,
    @Body() dto: CustomerRegisterDto,
  ) {
    return this.customerService.register(
      req.user.sub,
      dto,
    );
  }
}