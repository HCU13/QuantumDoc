-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastVideoWatchDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "subscriptionValidUntil" TIMESTAMP(3),
ADD COLUMN     "tokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "watchedVideosToday" INTEGER NOT NULL DEFAULT 0;
