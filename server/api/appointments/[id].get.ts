export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      doctor: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      service: true,
    },
  })

  if (!appointment) throw createError({ statusCode: 404, statusMessage: 'Призначення не знайдено' })

  // Access control
  const doctorProfile =
    auth.role === Roles.DOCTOR
      ? await prisma.doctorProfile.findUnique({ where: { userId: auth.userId } })
      : null

  const canAccess =
    auth.role === Roles.ADMIN ||
    appointment.clientId === auth.userId ||
    (doctorProfile && appointment.doctorId === doctorProfile.id)

  if (!canAccess) throw createError({ statusCode: 403, statusMessage: 'Доступ заборонено' })

  return appointment
})
