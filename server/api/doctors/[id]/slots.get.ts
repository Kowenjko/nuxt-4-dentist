// GET /api/doctors/:id/slots?date=2026-03-15&serviceId=...
//
// Всі розрахунки ведуться в київському часовому поясі (Europe/Kiev, UTC+2/+3).
// Київ: взимку UTC+2, влітку UTC+3 (DST).
// Для простоти і стабільності використовуємо фіксований UTC+2,
// або можна перемкнути на Intl.DateTimeFormat для DST-точності.
//
// Повертає: { meta, slots[] }
//   slot.time     — "09:00" (київський час)
//   slot.datetime — "2026-03-15T09:00:00" (без timezone, київський)
//   slot.available — false якщо зайнятий або в минулому
//   slot.period   — "morning"|"afternoon"|"evening"
//   slot.bookedBy — клієнт або null

// ── Константа UTC offset для Києва ──────────────────────────────
// Для DST-точності можна замінити на динамічний розрахунок через Intl,
// але +2 покриває зимовий час; для літнього достатньо +3.
// Встановлюємо через env або хардкодимо:
const KYIV_OFFSET_HOURS = 2 // UTC+2 (зима) / змініть на 3 для літа або зробіть динамічним

/**
 * Повертає поточний час у Києві як { year, month, day, hours, minutes }
 * з урахуванням DST через Intl.DateTimeFormat.
 */
const kyivNow = () => {
  const now = new Date()
  // Intl дає правильний DST для Europe/Kiev
  const fmt = new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]))
  return {
    year: parseInt(parts.year),
    month: parseInt(parts.month) - 1, // 0-based
    day: parseInt(parts.day),
    hours: parseInt(parts.hour === '24' ? '0' : parts.hour),
    minutes: parseInt(parts.minute),
  }
}

/**
 * Конвертує київський час "YYYY-MM-DD HH:MM" у UTC Date.
 * Використовує Intl-based offset для DST-точності.
 */
const kyivToUtc = (dateStr: string, timeStr: string): Date => {
  // Створюємо дату як ніби UTC, потім коригуємо на київський offset
  const naive = new Date(`${dateStr}T${timeStr}:00Z`)
  // Знаходимо реальний offset Києва для цього моменту
  const utcMs = naive.getTime()
  // Перебираємо offset: якщо Київ = UTC+2, то київський 09:00 = UTC 07:00
  // Robustний спосіб: взяти offset з Intl
  const kyivStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(naive)
  // kyivStr: "2026-03-15, 11:00" якщо UTC+2 і time="09:00"
  // Це неправильно — нам потрібно навпаки: дано київський час, знайти UTC
  // Бінарний пошук або простий розрахунок через відомий offset:
  const offsetMs = getKyivOffsetMs(naive)
  return new Date(utcMs - offsetMs)
}

/**
 * Повертає offset Києва в мілісекундах для заданого UTC-моменту.
 * Використовує Intl для DST-точності.
 */
const getKyivOffsetMs = (utcDate: Date): number => {
  const utcMidnight = new Date(
    Date.UTC(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      12,
      0,
      0 // полудень щоб не потрапити на DST-перехід
    )
  )
  const kyivHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Kiev',
      hour: 'numeric',
      hour12: false,
    }).format(utcMidnight)
  )
  const utcHour = utcMidnight.getUTCHours()
  return (kyivHour - utcHour) * 60 * 60 * 1000
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { date, serviceId } = getQuery(event)

  if (!date) throw createError({ statusCode: 400, statusMessage: 'date is required (YYYY-MM-DD)' })
  if (!serviceId) throw createError({ statusCode: 400, statusMessage: 'serviceId is required' })

  const dateStr = date as string
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid date format, expected YYYY-MM-DD',
    })
  }

  // ── Weekday за київським днем ────────────────────────────────────────
  // "2026-03-15" — беремо день тижня як є (дата вже київська з фронту)
  const [y, mo, d] = dateStr.split('-').map(Number)
  const weekday = new Date(y, mo - 1, d).getDay() // local — але ми просто хочемо day-of-week за календарем

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
  if (!daySchedule)
    return { meta: { date, workStart: null, workEnd: null, lunchBreak: null }, slots: [] }

  const [startH, startM] = daySchedule.startTime.split(':').map(Number)
  const [endH, endM] = daySchedule.endTime.split(':').map(Number)

  const slotDuration = service.duration
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  // ── Поточний час У КИЄВІ для блокування минулих слотів ──────────────
  const kyiv = kyivNow()
  const isToday = kyiv.year === y && kyiv.month === mo - 1 && kyiv.day === d
  const nowMinutes = isToday ? kyiv.hours * 60 + kyiv.minutes : -1

  // ── Обідня перерва ────────────────────────────────────────────────────
  let lunchStartMin = -1
  let lunchEndMin = -1
  if (daySchedule.lunchStart && daySchedule.lunchEnd) {
    const [lhS, lmS] = daySchedule.lunchStart.split(':').map(Number)
    const [lhE, lmE] = daySchedule.lunchEnd.split(':').map(Number)
    lunchStartMin = lhS * 60 + lmS
    lunchEndMin = lhE * 60 + lmE
  }

  const isLunchOverlap = (slotStart: number, slotEnd: number): boolean => {
    if (lunchStartMin === -1) return false
    return slotStart < lunchEndMin && slotEnd > lunchStartMin
  }

  // ── Будуємо слоти ─────────────────────────────────────────────────────
  const allSlots: {
    time: string
    datetime: string
    startUtc: Date // UTC Date для зіставлення з БД
    endUtc: Date
    available: boolean
    period: 'morning' | 'afternoon' | 'evening'
  }[] = []

  let cur = startMinutes

  while (cur + slotDuration <= endMinutes) {
    const slotEnd = cur + slotDuration

    if (isLunchOverlap(cur, slotEnd)) {
      cur = cur < lunchStartMin ? lunchEndMin : cur + slotDuration
      continue
    }

    const h = Math.floor(cur / 60)
    const m = cur % 60
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    const time = `${hh}:${mm}`
    // datetime — київський час без timezone (фронт відображає як є)
    const datetime = `${dateStr}T${time}:00`

    // Конвертуємо київський час → UTC для порівняння з Prisma
    const startUtc = kyivToUtc(dateStr, time)
    const endUtc = new Date(startUtc.getTime() + slotDuration * 60 * 1000)

    // Слот у минулому за київським часом (+ буфер 5 хв)
    const isPast = nowMinutes !== -1 && cur < nowMinutes + 5

    const period: 'morning' | 'afternoon' | 'evening' =
      h < 13 ? 'morning' : h < 18 ? 'afternoon' : 'evening'

    allSlots.push({ time, datetime, startUtc, endUtc, available: !isPast, period })
    cur += slotDuration
  }

  if (allSlots.length === 0) {
    return {
      meta: {
        date,
        workStart: daySchedule.startTime,
        workEnd: daySchedule.endTime,
        lunchBreak: null,
      },
      slots: [],
    }
  }

  // ── Записи за день (UTC-межі київського дня) ─────────────────────────
  // Київський день: 00:00 Kyiv = (00:00 - offset) UTC
  // Напр. UTC+2: 2026-03-15 00:00 Kyiv = 2026-03-14 22:00 UTC
  const dayStartUtc = kyivToUtc(dateStr, '00:00')
  const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000 - 1)

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId: id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      startTime: { gte: dayStartUtc, lte: dayEndUtc },
    },
    select: {
      startTime: true,
      endTime: true,
      client: {
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      },
    },
  })

  // ── Позначаємо зайняті слоти ──────────────────────────────────────────
  const lunchBreak =
    lunchStartMin !== -1 ? { start: daySchedule.lunchStart, end: daySchedule.lunchEnd } : null

  const slots = allSlots.map(({ time, datetime, startUtc, endUtc, available, period }) => {
    const sMs = startUtc.getTime()
    const eMs = endUtc.getTime()

    const overlap = booked.find(
      (appt) => appt.startTime.getTime() < eMs && appt.endTime.getTime() > sMs
    )

    return {
      time,
      datetime,
      available: available && !overlap,
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
