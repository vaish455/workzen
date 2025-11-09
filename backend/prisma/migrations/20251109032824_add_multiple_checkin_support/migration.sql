-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "currentlyCheckedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessions" JSONB;
