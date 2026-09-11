-- CreateEnum
CREATE TYPE "NotificationOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- DropIndex
DROP INDEX "Notification_userId_isRead_idx";

-- AlterTable
ALTER TABLE "DeviceToken" ALTER COLUMN "audience" DROP NOT NULL;

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audience" "NotificationAudience" NOT NULL,
    "status" "NotificationOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 5,
    "nextRetryAt" TIMESTAMP(3),
    "processingAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_notificationId_key" ON "NotificationOutbox"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationOutbox_status_nextRetryAt_idx" ON "NotificationOutbox"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "NotificationOutbox_userId_audience_idx" ON "NotificationOutbox"("userId", "audience");

-- CreateIndex
CREATE INDEX "NotificationOutbox_createdAt_idx" ON "NotificationOutbox"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_audience_idx" ON "Notification"("userId", "audience");

-- CreateIndex
CREATE INDEX "Notification_userId_audience_isRead_idx" ON "Notification"("userId", "audience", "isRead");

-- AddForeignKey
ALTER TABLE "NotificationOutbox" ADD CONSTRAINT "NotificationOutbox_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
