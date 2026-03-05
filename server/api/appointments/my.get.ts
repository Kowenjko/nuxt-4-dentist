// server/api/appointments/my.get.ts
// ─────────────────────────────────────────────────────────────────────────
// GET /api/appointments/my
//
// Повертає записи поточного авторизованого користувача.
// Клієнти бачать свої записи як пацієнти.
// Лікарі бачать записи до них.
// Адміни отримують 403 — для них є /api/appointments із фільтрами.
//
// Query params:
//   status  — PENDING | CONFIRMED | CANCELLED | COMPLETED
//   period  — upcoming | past | all (default: all)
//   page    — номер сторінки (default: 1)
//   limit   — записів на сторінку (default: 20, max: 100)
//   sort    — asc | desc (default: desc — найновіші перші)
// ─────────────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  // ── Auth ───────────────────────────────────────────────────────
  const auth = await requireAuth(event)

  if (auth.role === Roles.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Адміністратори використовують /api/appointments з фільтрами',
    })
  }

  // ── Query params ───────────────────────────────────────────────
  const { status, period = Periods.ALL, page = '1', limit = '20', sort = 'desc' } = getQuery(event)

  const pageNum = Math.max(1, parseInt(page as string) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20))
  const skip = (pageNum - 1) * limitNum
  const orderDir = sort === 'asc' ? 'asc' : 'desc'

  // ── Build where ────────────────────────────────────────────────
  const where: Record<string, any> = {}

  if (auth.role === Roles.CLIENT) {
    // Клієнт — бачить тільки свої записи
    where.clientId = auth.userId
  } else if (auth.role === Roles.DOCTOR) {
    // Лікар — бачить записи до свого профілю
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    })
    if (!doctorProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Профіль лікаря не знайдено',
      })
    }
    where.doctorId = doctorProfile.id
  }

  // Фільтр по статусу
  if (
    status &&
    [Status.PENDING, Status.CONFIRMED, Status.CANCELLED, Status.COMPLETED].includes(status as any)
  ) {
    where.status = status
  }

  // Фільтр по часовому періоду
  const now = new Date()
  if (period === Periods.UPCOMING) {
    where.startTime = { gte: now }
    // Upcoming = тільки активні статуси
    if (!where.status) {
      where.status = { in: [Status.PENDING, Status.CONFIRMED] }
    }
  } else if (period === Periods.PAST) {
    where.startTime = { lt: now }
  }

  // ── Query ──────────────────────────────────────────────────────
  const include = {
    client: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
    },
    doctor: {
      select: {
        id: true,
        specialty: true,
        bio: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    },
    service: {
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
      },
    },
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limitNum,
      include,
      orderBy: { startTime: orderDir },
    }),
    prisma.appointment.count({ where }),
  ])

  // ── Aggregate counts ───────────────────────────────────────────
  // Повертаємо кількість по кожному статусу для UI-табів (без доп. запитів не обійтись)
  const baseWhere =
    auth.role === Roles.CLIENT ? { clientId: auth.userId } : { doctorId: where.doctorId }

  const [countPending, countConfirmed, countCancelled, countCompleted, countUpcoming, countPast] =
    await Promise.all([
      prisma.appointment.count({ where: { ...baseWhere, status: Status.PENDING } }),
      prisma.appointment.count({ where: { ...baseWhere, status: Status.CONFIRMED } }),
      prisma.appointment.count({ where: { ...baseWhere, status: Status.CANCELLED } }),
      prisma.appointment.count({ where: { ...baseWhere, status: Status.COMPLETED } }),
      prisma.appointment.count({
        where: {
          ...baseWhere,
          status: { in: [Status.PENDING, Status.CONFIRMED] },
          startTime: { gte: now },
        },
      }),
      prisma.appointment.count({ where: { ...baseWhere, startTime: { lt: now } } }),
    ])

  // ── Response ───────────────────────────────────────────────────
  return {
    data: appointments,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    counts: {
      all: total,
      upcoming: countUpcoming,
      past: countPast,
      pending: countPending,
      confirmed: countConfirmed,
      cancelled: countCancelled,
      completed: countCompleted,
    },
    meta: {
      userId: auth.userId,
      role: auth.role,
      period: period as string,
      sort: orderDir,
    },
  }
})
