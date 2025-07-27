-- AlterTable
ALTER TABLE "booking_details_types" ADD COLUMN     "months" INTEGER;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isMonthlySubscription" BOOLEAN DEFAULT false;
