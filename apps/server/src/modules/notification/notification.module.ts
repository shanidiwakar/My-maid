import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationOutboxProcessor } from './notification-outbox.processor';
import { NotificationOutboxScheduler } from './notification-outbox.scheduler';

@Module({
  controllers: [
    NotificationController,
  ],
  providers: [
    NotificationService,
    NotificationOutboxProcessor,
    NotificationOutboxScheduler
  ],
  exports: [
    NotificationService,
    NotificationOutboxProcessor
  ],
})
export class NotificationModule {}