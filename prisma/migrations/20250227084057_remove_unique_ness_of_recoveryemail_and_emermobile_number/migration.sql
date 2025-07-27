/*
  Warnings:

  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "buyer_emergency_mobile_number_key";

-- DropIndex
DROP INDEX "buyer_recoveryEmail_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
