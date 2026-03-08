export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { date, serviceId } = getQuery(event)

  if (!date) throw createError({ statusCode: 400, statusMessage: 'date is required (YYYY-MM-DD)' })
  if (!serviceId) throw createError({ statusCode: 400, statusMessage: 'serviceId is required' })

  // Валідація дати
  const dateStr = date as string
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date format, expected YYYY-MM-DD',
    })
  }

  const parsedDate = new Date(dateStr + 'T00:00:00Z')
  if (isNaN(parsedDate.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }

  // 0=Sun, 1=Mon ... 6=Sat — беремо UTC день тижня
  const weekday = parsedDate.getUTCDay()

  const [doctor, service] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { id },
      include: { doctorSchedule: { where: { weekday, isWorking: true } } },
    }),
    prisma.service.findUnique({ where: { id: serviceId as string } }),
  ])

  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Doctor not found' })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Service not found' })

  const daySchedule = doctor.doctorSchedule[0]
  if (!daySchedule) return [] // лікар не працює в цей день

  // ── Розраховуємо всі слоти дня ──────────────────────────────────────

  const [startH, startM] = daySchedule.startTime.split(':').map(Number)
  const [endH, endM] = daySchedule.endTime.split(':').map(Number)

  const slotDuration = service.duration // хвилин
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  // Поточний момент — для блокування слотів у минулому
  const now = new Date()
  const nowMinutes =
    now.getUTCFullYear() === parsedDate.getUTCFullYear() &&
    now.getUTCMonth() === parsedDate.getUTCMonth() &&
    now.getUTCDate() === parsedDate.getUTCDate()
      ? now.getUTCHours() * 60 + now.getUTCMinutes()
      : -1 // дата в майбутньому — нічого не блокуємо

  // ── Обідня перерва ──────────────────────────────────────────────────
  // lunchStart/lunchEnd — опціональні поля, можуть бути null
  let lunchStartMin = -1
  let lunchEndMin = -1

  if (daySchedule.lunchStart && daySchedule.lunchEnd) {
    const [lhS, lmS] = daySchedule.lunchStart.split(':').map(Number)
    const [lhE, lmE] = daySchedule.lunchEnd.split(':').map(Number)
    lunchStartMin = lhS * 60 + lmS
    lunchEndMin = lhE * 60 + lmE
  }

  /**
   * Перевіряє чи слот [slotStart, slotEnd) перекривається з обідньою перервою.
   * Слот блокується якщо він ПОЧИНАЄТЬСЯ або ЗАКІНЧУЄТЬСЯ під час обіду,
   * або якщо він повністю поглинає перерву.
   */
  const isLunchOverlap = (slotStart: number, slotEnd: number): boolean => {
    if (lunchStartMin === -1) return false
    return slotStart < lunchEndMin && slotEnd > lunchStartMin
  }

  // ── Будуємо список всіх слотів ───────────────────────────────────────
  const allSlots: {
    time: string
    datetime: string
    startIso: string
    endIso: string
    available: boolean
    period: 'morning' | 'afternoon' | 'evening'
  }[] = []

  let cur = startMinutes

  while (cur + slotDuration <= endMinutes) {
    const slotEnd = cur + slotDuration

    // Пропускаємо слоти що перекриваються з обідом — їх не показуємо взагалі
    if (isLunchOverlap(cur, slotEnd)) {
      // Якщо слот починається до обіду але заходить в нього — пропускаємо
      // і рухаємось до кінця обіду
      if (cur < lunchStartMin) {
        cur = lunchEndMin
      } else {
        cur += slotDuration
      }
      continue
    }

    const h = Math.floor(cur / 60)
    const m = cur % 60
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    const time = `${hh}:${mm}`

    // datetime без timezone — фронт використовує як є
    const datetime = `${dateStr}T${time}:00`

    // ISO рядки для зіставлення з Prisma (UTC)
    const slotStart = new Date(dateStr + `T${time}:00Z`)
    const slotEnd_ = new Date(slotStart.getTime() + slotDuration * 60 * 1000)

    // Слот у минулому — блокуємо (+ буфер 5 хв)
    const isPast = nowMinutes !== -1 && cur < nowMinutes + 5

    // period за годиною початку
    const period: 'morning' | 'afternoon' | 'evening' =
      h < 13 ? 'morning' : h < 18 ? 'afternoon' : 'evening'

    allSlots.push({
      time,
      datetime,
      startIso: slotStart.toISOString(),
      endIso: slotEnd_.toISOString(),
      available: !isPast,
      period,
    })

    cur += slotDuration
  }

  if (allSlots.length === 0) return []

  // ── Отримуємо вже зайняті записи за день ────────────────────────────
  // Беремо з запасом ±1 день щоб не пропустити записи через timezone зсув

  const dayStart = new Date(dateStr + 'T00:00:00Z')
  const dayEnd = new Date(dateStr + 'T23:59:59Z')

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId: id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      // Шукаємо всі записи що перекриваються з цим днем
      startTime: { gte: dayStart, lte: dayEnd },
    },
    select: {
      startTime: true,
      endTime: true,
      client: {
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      },
    },
  })

  // ── Позначаємо зайняті слоти ─────────────────────────────────────────
  // Порівнюємо в мілісекундах (не рядках) — уникаємо timezone мismatch.
  // Слот зайнятий якщо будь-який запис ПЕРЕКРИВАЄТЬСЯ з ним:
  //   запис.startTime < слот.endTime  &&  запис.endTime > слот.startTime

  // Метадані обіду — фронт може показати "перерва 13:00–14:00" в UI
  const lunchBreak =
    lunchStartMin !== -1 ? { start: daySchedule.lunchStart, end: daySchedule.lunchEnd } : null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const slots = allSlots.map(({ time, datetime, startIso, endIso, available, period }) => {
    const slotStart = new Date(startIso).getTime()
    const slotEnd = new Date(endIso).getTime()

    // Знаходимо запис що перекривається з цим слотом
    const overlap = booked.find((appt) => {
      const aStart = appt.startTime.getTime()
      const aEnd = appt.endTime.getTime()
      return aStart < slotEnd && aEnd > slotStart
    })

    const isBooked = !!overlap

    return {
      time,
      datetime,
      available: available && !isBooked,
      period,
      bookedBy: overlap?.client
        ? {
            id: overlap.client.id,
            name: overlap.client.name,
            email: overlap.client.email,
            phone: overlap.client.phone ?? null,
            avatar: overlap.client.avatar ?? null,
          }
        : null,
    }
  })

  // Повертаємо слоти + метадані дня (робочі години, обід)
  // Фронт: const { slots, meta } = await $fetch(...)
  return {
    meta: {
      date,
      workStart: daySchedule.startTime,
      workEnd: daySchedule.endTime,
      lunchBreak,
    },
    slots,
  }
})
