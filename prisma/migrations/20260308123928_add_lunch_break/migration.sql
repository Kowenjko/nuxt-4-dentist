/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,weekday]` on the table `DoctorSchedule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DoctorSchedule" DROP CONSTRAINT "DoctorSchedule_doctorId_fkey";

-- AlterTable
ALTER TABLE "DoctorSchedule" ADD COLUMN     "lunchEnd" TEXT,
ADD COLUMN     "lunchStart" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DoctorSchedule_doctorId_weekday_key" ON "DoctorSchedule"("doctorId", "weekday");

-- AddForeignKey
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
