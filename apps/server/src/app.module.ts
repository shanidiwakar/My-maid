import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AddressModule } from './modules/address/address.module';
import { LocationModule } from './modules/location/location.module';
import config from './config';

@Module({
  imports: [  
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      envFilePath: '.env',
    }),
    PrismaModule, HealthModule, AuthModule, UsersModule, ProfileModule, AddressModule, LocationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
