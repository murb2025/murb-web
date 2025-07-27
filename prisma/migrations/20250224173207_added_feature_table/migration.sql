-- CreateTable
CREATE TABLE "featured" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "featuredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featured_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "featured" ADD CONSTRAINT "featured_featuredBy_fkey" FOREIGN KEY ("featuredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured" ADD CONSTRAINT "featured_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
