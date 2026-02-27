export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, phone: true, avatar: true, email: true } },
      services: { select: { id: true, name: true, duration: true, price: true } },
      doctorSchedule: { orderBy: { weekday: 'asc' } },
    },
  })

  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Лікар не знайдений' })
  return doctor
})
