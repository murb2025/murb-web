/*
  Warnings:

  - You are about to drop the column `payedToVendor` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "payedToVendor";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "mobile_number" SET DATA TYPE TEXT;
