import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

ConfigModule.forRoot({
  isGlobal: true,
});
@Module({
  imports: [PrismaModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
