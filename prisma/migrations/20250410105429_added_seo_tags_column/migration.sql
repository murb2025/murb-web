-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isHomeService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seoTags" TEXT[];
