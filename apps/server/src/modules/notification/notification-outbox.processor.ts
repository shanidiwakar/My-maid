import { Injectable, Logger } from '@nestjs/common';
import { NotificationAudience } from '@prisma/client';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationOutboxProcessor {
  private readonly logger = new Logger(
    NotificationOutboxProcessor.name,
  );

  constructor(
    private readonly notificationService: NotificationService,
  ) { }

  async processBatch(batchSize = 100) {
    const jobs =
      await this.notificationService.claimOutboxBatch(
        batchSize,
      );

    if (!jobs.length) {
      return {
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
      };
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        const result =
          await this.processJob(job);

        if (result.status === 'SKIPPED') {
          const marked =
            await this.notificationService.markOutboxSkipped(
              job.id,
              result.reason,
            );

          if (marked) {
            skipped++;
          }

          continue;
        }

        const marked =
          await this.notificationService.markOutboxSent(
            job.id,
          );

        if (marked) {
          sent++;
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unknown notification processing error';

        const marked =
          await this.notificationService.markOutboxFailed(
            job.id,
            message,
          );

        if (marked) {
          failed++;
        }

        this.logger.error(
          `Notification outbox processing failed: ${job.id}`,
          error instanceof Error
            ? error.stack
            : undefined,
        );
      }
    }

    return {
      processed: jobs.length,
      sent,
      skipped,
      failed,
    };
  }

  private async processJob(
    job: {
      id: string;
      notification: {
        id: string;
        userId: string;
        audience: NotificationAudience;
        title: string;
        message: string;
        bookingId: string | null;
      };
    },
  ): Promise<
    | { status: 'SENT' }
    | { status: 'SKIPPED'; reason: string }
  > {
    const notification =
      job.notification;

    const devices =
      await this.notificationService.getActiveDeviceTokens(
        notification.userId,
        notification.audience,
      );

    if (!devices.length) {
      return {
        status: 'SKIPPED',
        reason: 'NO_ACTIVE_DEVICE_TOKEN',
      };
    }

    /*
     * FCM/APNs integration will be added later.
     */

    return {
      status: 'SKIPPED',
      reason: 'PUSH_PROVIDER_NOT_CONFIGURED',
    };
  }
}