import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtConfig } from 'src/config/Jwt.config';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async sendOtp(phone: string) {
    const otp = '123456';

    await this.prisma.otpVerification.create({
      data: {
        phone,
        otp,
        purpose: 'LOGIN',
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    });

    return {
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(phone: string, otp: string) {
    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        phone,
        otp,
        purpose: 'LOGIN',
        verifiedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await this.prisma.otpVerification.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    });

    // Find existing user
    let user = await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });

    // Create user if first login
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role: 'CUSTOMER',
          isVerified: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    
    const jwtConfig = this.config.get<JwtConfig>('jwt');

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig!.refreshSecret,
      expiresIn: jwtConfig!.refreshExpiresIn,
    });
    
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ),
      },
    });
    
    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
      },
    };
  }

  async refresh(token: string) {

    const dbToken =
      await this.prisma.refreshToken.findUnique({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

    if (!dbToken)
      throw new UnauthorizedException();

    if (dbToken.revokedAt)
      throw new UnauthorizedException();

    if (dbToken.expiresAt < new Date())
      throw new UnauthorizedException();

    const payload = {
      sub: dbToken.user.id,
      phone: dbToken.user.phone,
      role: dbToken.user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }

  async logout(refreshToken: string) {

    await this.prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }
}