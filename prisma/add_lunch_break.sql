-- Додає поля обідньої перерви до таблиці DoctorSchedule
-- Обидва поля опціональні: NULL = перерви немає
--
-- Run: npx prisma migrate dev --name add_lunch_break
--  або npx prisma db push

ALTER TABLE "DoctorSchedule"
  ADD COLUMN "lunchStart" TEXT DEFAULT NULL,
  ADD COLUMN "lunchEnd"   TEXT DEFAULT NULL;