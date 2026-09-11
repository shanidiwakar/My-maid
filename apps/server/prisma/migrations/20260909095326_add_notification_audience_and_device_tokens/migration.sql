CREATE TYPE "NotificationAudience"
AS ENUM ('CUSTOMER', 'PARTNER', 'ADMIN');

CREATE TYPE "DevicePlatform"
AS ENUM ('ANDROID', 'IOS');

ALTER TABLE "Notification"
ADD COLUMN "audience" "NotificationAudience";

UPDATE "Notification"
SET "audience" = 'CUSTOMER'
WHERE "audience" IS NULL;

UPDATE "Notification"
SET "audience" = 'PARTNER'
WHERE "title" = 'New booking assigned';

ALTER TABLE "Notification"
ALTER COLUMN "audience" SET NOT NULL;

CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "audience" "NotificationAudience" NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeviceToken_token_key"
ON "DeviceToken"("token");

CREATE INDEX "DeviceToken_userId_idx"
ON "DeviceToken"("userId");

CREATE INDEX "DeviceToken_userId_audience_idx"
ON "DeviceToken"("userId", "audience");

CREATE INDEX "DeviceToken_userId_isActive_idx"
ON "DeviceToken"("userId", "isActive");

ALTER TABLE "DeviceToken"
ADD CONSTRAINT "DeviceToken_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;