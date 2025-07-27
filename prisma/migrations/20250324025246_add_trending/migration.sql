-- CreateTable
CREATE TABLE "trending" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "trendingBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trending_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trending_eventId_key" ON "trending"("eventId");

-- AddForeignKey
ALTER TABLE "trending" ADD CONSTRAINT "trending_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trending" ADD CONSTRAINT "trending_trendingBy_fkey" FOREIGN KEY ("trendingBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
