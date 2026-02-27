// Returns available time slots for a doctor on a specific date
// Query: ?date=2024-03-15&serviceId=...
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { date, serviceId } = getQuery(event)

  if (!date)
    throw createError({ statusCode: 400, statusMessage: "дата є обов'язковою (РРРР-ММ-ДД)" })
  if (!serviceId) throw createError({ statusCode: 400, statusMessage: "serviceId є обов'язковим" })

  const parsedDate = new Date(date as string)
  if (isNaN(parsedDate.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Неправильний формат дати' })
  }

  const weekday = parsedDate.getUTCDay() // 0=Sun, 6=Sat

  const [doctor, service] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { id },
      include: { doctorSchedule: { where: { weekday, isWorking: true } } },
    }),
    prisma.service.findUnique({ where: { id: serviceId as string } }),
  ])

  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Лікар не знайдений' })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Послуга не знайдена' })

  const daySchedule = doctor.doctorSchedule[0]
  if (!daySchedule) return [] // Doctor doesn't work this day

  // Parse working hours
  const [startH, startM] = daySchedule.startTime.split(':').map(Number)
  const [endH, endM] = daySchedule.endTime.split(':').map(Number)

  const slotDuration = service.duration // minutes

  // Build all potential slots
  const slots: { startTime: string; endTime: string }[] = []
  let currentMinutes = startH! * 60 + startM!
  const endMinutes = endH! * 60 + endM!

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotStart = new Date(parsedDate)
    slotStart.setUTCHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)

    const slotEnd = new Date(slotStart)
    slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + slotDuration)

    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
    })

    currentMinutes += slotDuration
  }

  // Fetch existing appointments to exclude booked slots
  const dayStart = new Date(parsedDate)
  dayStart.setUTCHours(0, 0, 0, 0)
  const dayEnd = new Date(parsedDate)
  dayEnd.setUTCHours(23, 59, 59, 999)

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: id,
      startTime: { gte: dayStart, lte: dayEnd },
      status: { in: [Status.PENDING, Status.CONFIRMED] },
    },
    select: { startTime: true, endTime: true },
  })

  const bookedTimes = new Set(existingAppointments.map((a) => a.startTime.toISOString()))

  const available = slots.filter((s) => !bookedTimes.has(s.startTime))

  return available
})
