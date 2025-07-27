-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE');

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "payment_rollouts" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "doneById" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_rollouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_rollouts_bookingId_key" ON "payment_rollouts"("bookingId");

-- AddForeignKey
ALTER TABLE "payment_rollouts" ADD CONSTRAINT "payment_rollouts_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_rollouts" ADD CONSTRAINT "payment_rollouts_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
