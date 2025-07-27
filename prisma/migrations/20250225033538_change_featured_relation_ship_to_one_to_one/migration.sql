/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `featured` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "featured_eventId_key" ON "featured"("eventId");
