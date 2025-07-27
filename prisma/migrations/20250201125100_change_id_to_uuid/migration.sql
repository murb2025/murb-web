/*
  Warnings:

  - The primary key for the `admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `booking_details_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `bookings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `bookings` table. All the data in the column will be lost.
  - The `status` column on the `bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `bookmarks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `buyer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_promotion_packages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_sub_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `event_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `additionalInfo` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `certificate` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `closing_time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_online` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_recurring` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `occupancy` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `opening_time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `slots_per_day` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `teamType` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `total_participants` on the `events` table. All the data in the column will be lost.
  - The primary key for the `message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `otps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `title` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `otps` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `otps` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_details_types" DROP CONSTRAINT "booking_details_types_eventId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_eventId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_eventId_fkey";

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_fkey";

-- DropForeignKey
ALTER TABLE "buyer" DROP CONSTRAINT "buyer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "event_sub_categories" DROP CONSTRAINT "fk_category";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_event_categoriesId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_event_sub_categoriesId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_vendor_id_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_eventsId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor" DROP CONSTRAINT "vendor_user_id_fkey";

-- AlterTable
ALTER TABLE "admin" DROP CONSTRAINT "admin_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "admin_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "booking_details_types" DROP CONSTRAINT "booking_details_types_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "eventId" SET DATA TYPE TEXT,
ADD CONSTRAINT "booking_details_types_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "booking_details_types_id_seq";

-- AlterTable
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_pkey",
DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "bookingChartId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "eventId" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "bookings_id_seq";

-- AlterTable
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "eventId" SET DATA TYPE TEXT,
ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "bookmarks_id_seq";

-- AlterTable
ALTER TABLE "buyer" DROP CONSTRAINT "buyer_pkey",
ADD COLUMN     "address" VARCHAR(255),
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "buyer_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "event_categories" DROP CONSTRAINT "event_categories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_categories_id_seq";

-- AlterTable
ALTER TABLE "event_promotion_packages" DROP CONSTRAINT "event_promotion_packages_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_promotion_packages_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_promotion_packages_id_seq";

-- AlterTable
ALTER TABLE "event_sub_categories" DROP CONSTRAINT "event_sub_categories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_sub_categories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_sub_categories_id_seq";

-- AlterTable
ALTER TABLE "event_types" DROP CONSTRAINT "event_types_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "event_types_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "event_types_id_seq";

-- AlterTable
ALTER TABLE "events" DROP CONSTRAINT "events_pkey",
DROP COLUMN "additionalInfo",
DROP COLUMN "category",
DROP COLUMN "certificate",
DROP COLUMN "closing_time",
DROP COLUMN "is_online",
DROP COLUMN "is_recurring",
DROP COLUMN "name",
DROP COLUMN "occupancy",
DROP COLUMN "opening_time",
DROP COLUMN "slots_per_day",
DROP COLUMN "teamType",
DROP COLUMN "total_participants",
ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "isHaveSlots" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTeamEvent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "multipleDays" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "team_size" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vendor_id" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "slot_duration" DROP NOT NULL,
ALTER COLUMN "event_categoriesId" SET DATA TYPE TEXT,
ALTER COLUMN "event_sub_categoriesId" SET DATA TYPE TEXT,
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "events_id_seq";

-- AlterTable
ALTER TABLE "message" DROP CONSTRAINT "message_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sender_id" SET DATA TYPE TEXT,
ALTER COLUMN "receiver_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "message_id_seq";

-- AlterTable
ALTER TABLE "otps" DROP CONSTRAINT "otps_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ADD CONSTRAINT "otps_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "otps_id_seq";

-- AlterTable
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "eventsId" SET DATA TYPE TEXT,
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "reviews_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AlterTable
ALTER TABLE "vendor" DROP CONSTRAINT "vendor_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "vendor_pkey" PRIMARY KEY ("user_id");

-- CreateTable
CREATE TABLE "bookingChart" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "slot" JSONB,
    "bookedSeats" INTEGER NOT NULL,

    CONSTRAINT "bookingChart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer" ADD CONSTRAINT "buyer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sub_categories" ADD CONSTRAINT "fk_category" FOREIGN KEY ("category_id") REFERENCES "event_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_categoriesId_fkey" FOREIGN KEY ("event_categoriesId") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_sub_categoriesId_fkey" FOREIGN KEY ("event_sub_categoriesId") REFERENCES "event_sub_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingChart" ADD CONSTRAINT "bookingChart_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_details_types" ADD CONSTRAINT "booking_details_types_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bookingChartId_fkey" FOREIGN KEY ("bookingChartId") REFERENCES "bookingChart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_eventsId_fkey" FOREIGN KEY ("eventsId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
