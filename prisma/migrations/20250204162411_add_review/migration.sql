/*
  Warnings:

  - You are about to drop the column `eventsId` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_eventsId_fkey";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "eventsId",
ADD COLUMN     "eventId" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
