export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const doctor = await prisma.doctorProfile.findUnique({ where: { id } })
  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Лікар не знайдений' })

  const schedule = await prisma.doctorSchedule.findMany({
    where: { doctorId: id },
    orderBy: { weekday: 'asc' },
  })

  return schedule
})
