import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationOutboxProcessor } from './notification-outbox.processor';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationOutboxScheduler {
  private readonly logger = new Logger(
    NotificationOutboxScheduler.name,
  );

  constructor(
    private readonly notificationOutboxProcessor:
      NotificationOutboxProcessor,

    private readonly notificationService:
      NotificationService,
  ) {}

  @Cron('*/10 * * * * *', {
    name: 'notification-outbox-processor',
    waitForCompletion: true,
  })
  async processOutbox() {
    try {
      const result =
        await this.notificationOutboxProcessor.processBatch(
          100,
        );

      if (result.processed > 0) {
        this.logger.log(
          `Outbox processed=${result.processed}, sent=${result.sent}, failed=${result.failed}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to process notification outbox',
        error instanceof Error
          ? error.stack
          : undefined,
      );
    }
  }

  @Cron('0 * * * * *', {
    name: 'notification-outbox-recovery',
    waitForCompletion: true,
  })
  async recoverStaleJobs() {
    try {
      const result =
        await this.notificationService.recoverStaleOutbox(
          5,
        );

      if (
        result.recoveredCount > 0 ||
        result.failedCount > 0
      ) {
        this.logger.warn(
          `Recovered=${result.recoveredCount}, permanentlyFailed=${result.failedCount}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to recover stale notification jobs',
        error instanceof Error
          ? error.stack
          : undefined,
      );
    }
  }
}