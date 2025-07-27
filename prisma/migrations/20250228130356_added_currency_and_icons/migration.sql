-- AlterTable
ALTER TABLE "booking_details_types" ADD COLUMN     "currencyIcon" VARCHAR(10) NOT NULL DEFAULT '₹',
ALTER COLUMN "currency" SET DEFAULT 'INR';
