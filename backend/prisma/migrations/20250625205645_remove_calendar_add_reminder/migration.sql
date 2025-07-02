/*
  Warnings:

  - You are about to drop the `CalendarEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_userId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "reminder" TIMESTAMP(3);

-- DropTable
DROP TABLE "CalendarEvent";
