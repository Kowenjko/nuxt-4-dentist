// Body: { schedule: [{ weekday: 0-6, startTime: "09:00", endTime: "18:00", isWorking: true, lunchStart?: "13:00", lunchEnd?: "14:00" }] }
export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')

  const doctor = await prisma.doctorProfile.findUnique({ where: { id } })
  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Doctor not found' })

  const { schedule } = await readBody(event)
  if (!Array.isArray(schedule)) {
    throw createError({ statusCode: 400, statusMessage: 'schedule must be an array' })
  }

  // Validate each day
  const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/
  for (const day of schedule) {
    if (day.weekday < 0 || day.weekday > 6) {
      throw createError({ statusCode: 400, statusMessage: `Invalid weekday: ${day.weekday}` })
    }
    if (day.isWorking && (!day.startTime || !day.endTime)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'startTime and endTime required for working days',
      })
    }
    // Валідація формату часу
    for (const field of ['startTime', 'endTime', 'lunchStart', 'lunchEnd']) {
      if (day[field] && !timeRe.test(day[field])) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid time format for ${field}: "${day[field]}", expected HH:MM`,
        })
      }
    }
    // Якщо є один з полів обіду — обидва обов'язкові
    if ((day.lunchStart && !day.lunchEnd) || (!day.lunchStart && day.lunchEnd)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'lunchStart and lunchEnd must be set together',
      })
    }
    // Перерва має бути всередині робочого дня
    if (day.lunchStart && day.lunchEnd && day.isWorking) {
      if (day.lunchStart <= day.startTime || day.lunchEnd >= day.endTime) {
        throw createError({
          statusCode: 400,
          statusMessage: `Lunch break must be within working hours (${day.startTime}–${day.endTime})`,
        })
      }
      if (day.lunchStart >= day.lunchEnd) {
        throw createError({ statusCode: 400, statusMessage: 'lunchStart must be before lunchEnd' })
      }
    }
  }

  // Перевіряємо чи вже застосована міграція add_lunch_break
  // (колонки lunchStart/lunchEnd можуть ще не існувати)
  const hasLunchColumns = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM information_schema.columns
    WHERE table_name = 'DoctorSchedule'
      AND column_name = 'lunchStart'
  `
    .then((r) => Number(r[0]?.count ?? 0) > 0)
    .catch(() => false)

  const rows = schedule.map((s: any) => {
    const base = {
      doctorId: id!,
      weekday: s.weekday,
      startTime: s.startTime || '09:00',
      endTime: s.endTime || '18:00',
      isWorking: s.isWorking ?? true,
    }
    if (hasLunchColumns) {
      return { ...base, lunchStart: s.lunchStart || null, lunchEnd: s.lunchEnd || null }
    }
    return base
  })

  await prisma.$transaction([
    prisma.doctorSchedule.deleteMany({ where: { doctorId: id } }),
    prisma.doctorSchedule.createMany({ data: rows }),
  ])

  return prisma.doctorSchedule.findMany({
    where: { doctorId: id },
    orderBy: { weekday: 'asc' },
  })
})
