export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const appointment = await prisma.appointment.findUnique({ where: { id } })
  if (!appointment) throw createError({ statusCode: 404, statusMessage: 'Призначення не знайдено' })

  const doctorProfile =
    auth.role === Roles.DOCTOR
      ? await prisma.doctorProfile.findUnique({ where: { userId: auth.userId } })
      : null

  const isClient = appointment.clientId === auth.userId
  const isDoctor = doctorProfile && appointment.doctorId === doctorProfile.id
  const isAdmin = auth.role === Roles.ADMIN

  if (!isClient && !isDoctor && !isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Доступ заборонено' })
  }

  const body = await readBody(event)
  const data: any = {}

  // Clients can only cancel their own appointments
  if (isClient && !isAdmin) {
    if (body.status && body.status !== 'CANCELLED') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Клієнти можуть скасовувати лише свої записи',
      })
    }
    if (body.status === 'CANCELLED') data.status = 'CANCELLED'
    if (body.notes !== undefined) data.notes = body.notes
  } else {
    // Doctors and admins can change status and notes
    if (body.status) data.status = body.status
    if (body.notes !== undefined) data.notes = body.notes
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true, email: true, avatar: true } },
      doctor: { include: { user: { select: { name: true, avatar: true } } } },
      service: true,
    },
  })

  return updated
})
