// Body: { schedule: [{ weekday: 0-6, startTime: "09:00", endTime: "18:00", isWorking: true }] }
export default defineEventHandler(async (event) => {
  //const auth = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const doctor = await prisma.doctorProfile.findUnique({ where: { id } })
  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Лікар не знайдений' })

  //if (doctor.userId !== auth.userId && auth.role !== Roles.ADMIN) {
  // throw createError({ statusCode: 403, statusMessage: 'Доступ заборонено' })
  //}

  const { schedule } = await readBody(event)
  if (!Array.isArray(schedule)) {
    throw createError({ statusCode: 400, statusMessage: 'розклад повинен бути масивом' })
  }

  // Delete old schedule and recreate
  await prisma.doctorSchedule.deleteMany({ where: { doctorId: id } })

  const created = await prisma.doctorSchedule.createMany({
    data: schedule.map((s: any) => ({
      doctorId: id!,
      weekday: s.weekday,
      startTime: s.startTime,
      endTime: s.endTime,
      isWorking: s.isWorking ?? true,
    })),
  })

  return { count: created.count }
})
