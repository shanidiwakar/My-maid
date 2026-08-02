import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';

import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp,);
  }

  @Post('refresh')
  refresh(
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @Post('logout')
  logout(
    @Body() dto: LogoutDto,
  ) {
    return this.authService.logout(dto.refreshToken);
  }

}