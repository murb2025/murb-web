/*
  Warnings:

  - You are about to drop the column `event_categoriesId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `event_sub_categoriesId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `event_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_sub_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_sub_categories" DROP CONSTRAINT "fk_category";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_event_categoriesId_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_event_sub_categoriesId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "event_categoriesId",
DROP COLUMN "event_sub_categoriesId",
ADD COLUMN     "numberOfDays" INTEGER;

-- DropTable
DROP TABLE "event_categories";

-- DropTable
DROP TABLE "event_sub_categories";

-- DropTable
DROP TABLE "event_types";
