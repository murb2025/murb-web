/*
  Warnings:

  - You are about to drop the column `created_at` on the `event_promotion_packages` table. All the data in the column will be lost.
  - You are about to drop the column `package_currency` on the `event_promotion_packages` table. All the data in the column will be lost.
  - You are about to drop the column `package_description` on the `event_promotion_packages` table. All the data in the column will be lost.
  - You are about to drop the column `package_duration` on the `event_promotion_packages` table. All the data in the column will be lost.
  - You are about to drop the column `package_name` on the `event_promotion_packages` table. All the data in the column will be lost.
  - You are about to drop the column `package_price` on the `event_promotion_packages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `event_promotion_packages` table. All the data in the column will be lost.
  - Added the required column `packageCurrency` to the `event_promotion_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageDescription` to the `event_promotion_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageDuration` to the `event_promotion_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageName` to the `event_promotion_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagePrice` to the `event_promotion_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_promotion_packages" DROP COLUMN "created_at",
DROP COLUMN "package_currency",
DROP COLUMN "package_description",
DROP COLUMN "package_duration",
DROP COLUMN "package_name",
DROP COLUMN "package_price",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "packageCurrency" TEXT NOT NULL,
ADD COLUMN     "packageDescription" JSONB NOT NULL,
ADD COLUMN     "packageDuration" INTEGER NOT NULL,
ADD COLUMN     "packageName" TEXT NOT NULL,
ADD COLUMN     "packagePrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
