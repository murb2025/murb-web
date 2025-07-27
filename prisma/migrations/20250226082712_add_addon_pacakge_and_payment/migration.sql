-- AlterTable
ALTER TABLE "promotionPayment" ADD COLUMN     "event_addon_packagesId" TEXT;

-- CreateTable
CREATE TABLE "addonPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "addonId" TEXT NOT NULL,
    "paymentId" TEXT,
    "orderId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addonPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_addon_packages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_addon_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addonPayment_orderId_key" ON "addonPayment"("orderId");

-- AddForeignKey
ALTER TABLE "promotionPayment" ADD CONSTRAINT "promotionPayment_event_addon_packagesId_fkey" FOREIGN KEY ("event_addon_packagesId") REFERENCES "event_addon_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addonPayment" ADD CONSTRAINT "addonPayment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addonPayment" ADD CONSTRAINT "addonPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addonPayment" ADD CONSTRAINT "addonPayment_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "event_addon_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
