export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  const body = await readBody(event)
  const { doctorId, serviceId, startTime, notes } = body

  if (!doctorId || !serviceId || !startTime) {
    throw createError({
      statusCode: 400,
      statusMessage: "doctorId, serviceId та startTime є обов'язковими",
    })
  }

  const [doctor, service] = await Promise.all([
    prisma.doctorProfile.findUnique({ where: { id: doctorId } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
  ])

  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Доктор не знайдений' })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Послуга не знайдена' })

  // Verify the doctor offers this service
  const doctorHasService = await prisma.doctorProfile.findFirst({
    where: { id: doctorId, services: { some: { id: serviceId } } },
  })
  if (!doctorHasService) {
    throw createError({ statusCode: 400, statusMessage: 'Доктор не надає цю послугу' })
  }

  const start = new Date(startTime)
  const end = new Date(start.getTime() + service.duration * 60 * 1000)

  // Check for conflicts (unique constraint will also catch this, but gives better error)
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { in: [Status.PENDING, Status.CONFIRMED] },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    },
  })

  if (conflict) {
    throw createError({ statusCode: 409, statusMessage: 'Часовий слот вже заброньований' })
  }

  // Clients book for themselves; admins can specify clientId
  const clientId = auth.role === Roles.ADMIN && body.clientId ? body.clientId : auth.userId

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      doctorId,
      serviceId,
      startTime: start,
      endTime: end,
      notes: notes || null,
      status: Status.PENDING,
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      doctor: { include: { user: { select: { name: true, avatar: true } } } },
      service: true,
    },
  })

  // todo

  // ── Сповіщення клієнту (Viber + Email) — не блокує відповідь ──
  // Запускаємо у фоні: не await, щоб не затримувати API
  // notifyAppointmentCreated({
  //   client: {
  //     name: appointment.client.name,
  //     phone: appointment.client.phone,
  //     email: appointment.client.email,
  //   },
  //   doctor: {
  //     name: appointment.doctor.user.name,
  //     specialty: appointment.doctor.specialty,
  //   },
  //   service: {
  //     name: appointment.service.name,
  //     duration: appointment.service.duration,
  //     price: appointment.service.price,
  //   },
  //   appointment: {
  //     id: appointment.id,
  //     startTime: appointment.startTime,
  //     endTime: appointment.endTime,
  //   },
  // }).catch((err) => console.error('[notify] Неочікувана помилка:', err))

  return appointment
})
