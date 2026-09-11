import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma, NotificationAudience, NotificationOutboxStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(params: {
    userId: string;
    type: NotificationType;
    audience: NotificationAudience;
    title: string;
    message: string;
    bookingId?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const {
      userId,
      type,
      audience,
      title,
      message,
      bookingId,
      tx,
    } = params;

    const client = tx ?? this.prisma;

    const notification =
      await client.notification.create({
        data: {
          userId,
          type,
          audience,
          title,
          message,
          bookingId,
        },
      });

    await client.notificationOutbox.create({
      data: {
        notificationId:
          notification.id,

        userId,

        audience,

        status:
          NotificationOutboxStatus.PENDING,
      },
    });

    return notification;
  }

  async getNotifications(
    userId: string,
    query: NotificationQueryDto,
  ) {
    const {
      page = 1,
      limit = 10,
      audience,
    } = query;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(audience && {
        audience,
      }),
    };

    const [data, total] =
      await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where,

          orderBy: {
            createdAt: 'desc',
          },

          skip:
            (page - 1) * limit,

          take:
            limit,

          select: {
            id: true,
            type: true,
            audience: true,
            title: true,
            message: true,
            bookingId: true,
            isRead: true,
            readAt: true,
            createdAt: true,
          },
        }),

        this.prisma.notification.count({
          where,
        }),
      ]);

    return {
      data,

      meta: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ) {
    const notification =
      await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(
    userId: string,
    audience?: NotificationAudience,
  ) {
    const result =
      await this.prisma.notification.updateMany({
        where: {
          userId,

          ...(audience && {
            audience,
          }),

          isRead: false,
        },

        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

    return {
      updatedCount:
        result.count,
    };
  }

  async getUnreadCount(
    userId: string,
    audience?: NotificationAudience,
  ) {
    const count =
      await this.prisma.notification.count({
        where: {
          userId,

          ...(audience && {
            audience,
          }),

          isRead: false,
        },
      });

    return {
      unreadCount: count,
    };
  }

  async registerDeviceToken(
    userId: string,
    dto: RegisterDeviceTokenDto,
  ) {
    return this.prisma.deviceToken.upsert({
      where: {
        token: dto.token,
      },

      update: {
        userId,
        platform: dto.platform,
        audience: dto.audience,
        deviceId: dto.deviceId,
        isActive: true,
      },

      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
        audience: dto.audience,
        deviceId: dto.deviceId,
      },

      select: {
        id: true,
        platform: true,
        audience: true,
        deviceId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deactivateDeviceToken(
    userId: string,
    token: string,
  ) {
    const result =
      await this.prisma.deviceToken.updateMany({
        where: {
          userId,
          token,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

    if (result.count !== 1) {
      throw new NotFoundException(
        'Active device token not found',
      );
    }

    return {
      success: true,
    };
  }

  async getActiveDeviceTokens(
    userId: string,
    audience: NotificationAudience,
  ) {
    return this.prisma.deviceToken.findMany({
      where: {
        userId,
        audience,
        isActive: true,
      },
      select: {
        id: true,
        token: true,
        platform: true,
        audience: true,
        deviceId: true,
        updatedAt: true,
      },
    });
  }

  private async sendPushNotification(params: {
    userId: string;
    audience: NotificationAudience;
    title: string;
    message: string;
    data?: Record<string, string>;
  }) {
    const {
      userId,
      audience,
      title,
      message,
      data,
    } = params;

    const tokens =
      await this.getActivePushTokens(
        userId,
        audience,
      );

    if (!tokens.length) {
      return {
        sent: false,
        reason: 'NO_ACTIVE_DEVICE_TOKEN',
      };
    }

    // Firebase / APNs integration will be added later.
    // For now, we only prepare the delivery payload.

    return {
      sent: false,
      pendingIntegration: true,
      tokensCount: tokens.length,
      payload: {
        title,
        message,
        data,
      },
    };
  }

  private async getActivePushTokens(
    userId: string,
    audience: NotificationAudience,
  ) {
    const devices =
      await this.prisma.deviceToken.findMany({
        where: {
          userId,
          audience,
          isActive: true,
        },
        select: {
          token: true,
        },
      });

    return devices.map(
      (device) => device.token,
    );
  }

  async getPendingOutboxBatch(
    limit = 100,
  ) {
    const now = new Date();

    return this.prisma.notificationOutbox.findMany({
      where: {
        status:
          NotificationOutboxStatus.PENDING,

        OR: [
          {
            nextRetryAt: null,
          },
          {
            nextRetryAt: {
              lte: now,
            },
          },
        ],
      },

      orderBy: {
        createdAt: 'asc',
      },

      take: limit,

      include: {
        notification: {
          select: {
            id: true,
            userId: true,
            type: true,
            audience: true,
            title: true,
            message: true,
            bookingId: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async claimOutboxBatch(
    limit = 100,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<
          {
            id: string;
          }[]
        >`
        SELECT "id"
        FROM "NotificationOutbox"
        WHERE
          "status" = 'PENDING'
          AND (
            "nextRetryAt" IS NULL
            OR "nextRetryAt" <= NOW()
          )
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${limit}
      `;

        if (!rows.length) {
          return [];
        }

        const ids = rows.map(
          (row) => row.id,
        );

        await tx.notificationOutbox.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            status:
              NotificationOutboxStatus.PROCESSING,
            processingAt:
              new Date(),
          },
        });

        return tx.notificationOutbox.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          include: {
            notification: {
              select: {
                id: true,
                userId: true,
                type: true,
                audience: true,
                title: true,
                message: true,
                bookingId: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
      },
    );
  }

  async markOutboxSent(
    outboxId: string,
  ) {
    const result =
      await this.prisma.notificationOutbox.updateMany({
        where: {
          id: outboxId,
          status:
            NotificationOutboxStatus.PROCESSING,
        },
        data: {
          status:
            NotificationOutboxStatus.SENT,
          sentAt:
            new Date(),
          processingAt:
            null,
          lastError:
            null,
        },
      });

    return result.count === 1;
  }

  async markOutboxFailed(
    outboxId: string,
    error: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const outbox =
        await tx.notificationOutbox.findUnique({
          where: {
            id: outboxId,
          },
          select: {
            id: true,
            status: true,
            retryCount: true,
            maxRetries: true,
          },
        });

      if (
        !outbox ||
        outbox.status !== NotificationOutboxStatus.PROCESSING
      ) {
        return false;
      }

      const nextRetryCount =
        outbox.retryCount + 1;

      const exhausted =
        nextRetryCount >= outbox.maxRetries;

      // Exponential backoff:
      // 1m → 2m → 4m → 8m...
      const delaySeconds = Math.min(
        60 * 2 ** outbox.retryCount,
        3600,
      );

      const result =
        await tx.notificationOutbox.updateMany({
          where: {
            id: outboxId,
            status:
              NotificationOutboxStatus.PROCESSING,
          },
          data: {
            retryCount:
              nextRetryCount,

            status:
              exhausted
                ? NotificationOutboxStatus.FAILED
                : NotificationOutboxStatus.PENDING,

            processingAt:
              null,

            nextRetryAt:
              exhausted
                ? null
                : new Date(
                  Date.now() +
                  delaySeconds * 1000,
                ),

            failedAt:
              exhausted
                ? new Date()
                : null,

            lastError:
              error.slice(0, 2000),
          },
        });

      return result.count === 1;
    });
  }

  async markOutboxSkipped(
    outboxId: string,
    reason: string,
  ) {
    const result =
      await this.prisma.notificationOutbox.updateMany({
        where: {
          id: outboxId,
          status:
            NotificationOutboxStatus.PROCESSING,
        },
        data: {
          status:
            NotificationOutboxStatus.SKIPPED,

          processingAt:
            null,

          nextRetryAt:
            null,

          lastError:
            reason.slice(0, 2000),
        },
      });

    return result.count === 1;
  }

  async recoverStaleOutbox(
    staleAfterMinutes = 5,
  ) {
    const cutoff = new Date(
      Date.now() -
      staleAfterMinutes * 60 * 1000,
    );

    const staleRows =
      await this.prisma.notificationOutbox.findMany({
        where: {
          status:
            NotificationOutboxStatus.PROCESSING,

          processingAt: {
            lte: cutoff,
          },
        },

        select: {
          id: true,
          retryCount: true,
          maxRetries: true,
        },

        take: 500,
      });

    let recoveredCount = 0;
    let failedCount = 0;

    for (const row of staleRows) {
      const nextRetryCount =
        row.retryCount + 1;

      const exhausted =
        nextRetryCount >=
        row.maxRetries;

      const result =
        await this.prisma.notificationOutbox.updateMany({
          where: {
            id: row.id,

            status:
              NotificationOutboxStatus.PROCESSING,

            processingAt: {
              lte: cutoff,
            },
          },

          data: {
            retryCount:
              nextRetryCount,

            status:
              exhausted
                ? NotificationOutboxStatus.FAILED
                : NotificationOutboxStatus.PENDING,

            processingAt:
              null,

            nextRetryAt:
              exhausted
                ? null
                : new Date(),

            failedAt:
              exhausted
                ? new Date()
                : null,

            lastError:
              'Worker processing timeout',
          },
        });

      if (result.count === 1) {
        if (exhausted) {
          failedCount++;
        } else {
          recoveredCount++;
        }
      }
    }

    return {
      recoveredCount,
      failedCount,
    };
  }
}