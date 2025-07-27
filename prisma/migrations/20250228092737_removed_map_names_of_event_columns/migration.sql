/*
  Warnings:

  - You are about to drop the column `end_date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `ending_time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `event_specific_type` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `maximum_participants` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `slot_duration` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `sport_name` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `starting_time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `team_size` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `vendor_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `week_days` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_vendor_id_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "end_date",
DROP COLUMN "ending_time",
DROP COLUMN "event_specific_type",
DROP COLUMN "maximum_participants",
DROP COLUMN "slot_duration",
DROP COLUMN "sport_name",
DROP COLUMN "start_date",
DROP COLUMN "starting_time",
DROP COLUMN "team_size",
DROP COLUMN "vendor_id",
DROP COLUMN "week_days",
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "endingTime" TEXT,
ADD COLUMN     "eventSpecificType" TEXT,
ADD COLUMN     "maximumParticipants" INTEGER,
ADD COLUMN     "slotDuration" INTEGER,
ADD COLUMN     "sportType" TEXT,
ADD COLUMN     "startDate" TEXT,
ADD COLUMN     "startingTime" TEXT,
ADD COLUMN     "teamSize" INTEGER,
ADD COLUMN     "vendorId" TEXT,
ADD COLUMN     "weekDays" TEXT[];

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
