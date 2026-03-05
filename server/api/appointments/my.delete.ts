// server/api/appointments/my.delete.ts
// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/appointments/my
//
// Масове скасування (status → CANCELLED) власних записів.
// Фізичне видалення НЕ виконується — лише м'яке скасування.
// Адміни отримують 403 (для них є /api/appointments/:id).
//
// Body (JSON):
//   ids?      — string[]  — список конкретних ID для скасування
//               якщо не передано → скасовує ВСІ активні (PENDING/CONFIRMED)
//               майбутні записи поточного користувача
//
//   period?   — "all" | "upcoming"  (default: "upcoming")
//               Тільки якщо ids не передано:
//               "upcoming" — лише майбутні (startTime >= now)
//               "all"      — всі активні незалежно від дати
//
// Response:
//   { cancelled: number, ids: string[] }
// ─────────────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  // ── Auth ───────────────────────────────────────────────────────
  const auth = await requireAuth(event)

  if (auth.role === Roles.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Адміністратори використовують DELETE /api/appointments/:id',
    })
  }

  // ── Body ───────────────────────────────────────────────────────
  const body = await readBody(event).catch(() => ({}))
  const { ids, period = Periods.UPCOMING } = body as {
    ids?: string[]
    period?: Period
  }

  // ── Resolve owner filter ────────────────────────────────────────
  let ownerWhere: Record<string, any>

  if (auth.role === Roles.CLIENT) {
    ownerWhere = { clientId: auth.userId }
  } else {
    // DOCTOR — знаходимо профіль
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    })
    if (!doctorProfile) {
      throw createError({ statusCode: 404, statusMessage: 'Профіль лікаря не знайдено' })
    }
    ownerWhere = { doctorId: doctorProfile.id }
  }

  // ── Build where ────────────────────────────────────────────────
  let where: Record<string, any>

  if (Array.isArray(ids) && ids.length > 0) {
    // Перевіряємо що всі передані ID справді належать цьому користувачу
    // і мають статус який можна скасувати
    where = {
      id: { in: ids },
      status: { in: [Status.PENDING, Status.CONFIRMED] },
      ...ownerWhere,
    }
  } else {
    // Скасовуємо всі активні записи (з урахуванням period)
    const now = new Date()
    where = {
      status: { in: [Status.PENDING, Status.CONFIRMED] },
      ...ownerWhere,
      ...(period === Periods.UPCOMING ? { startTime: { gte: now } } : {}),
    }
  }

  // ── Guard: нічого не знайдено ──────────────────────────────────
  const count = await prisma.appointment.count({ where })

  if (count === 0) {
    return {
      cancelled: 0,
      ids: [],
      message: 'Немає записів для скасування',
    }
  }

  // ── Collect IDs before update (for response) ───────────────────
  const toCancel = await prisma.appointment.findMany({
    where,
    select: { id: true },
  })
  const cancelIds = toCancel.map((a) => a.id)

  // ── Bulk cancel ────────────────────────────────────────────────
  const result = await prisma.appointment.updateMany({
    where,
    data: { status: Status.CANCELLED },
  })

  return {
    cancelled: result.count,
    ids: cancelIds,
    message: `Скасовано ${result.count} ${plural(result.count, 'запис', 'записи', 'записів')}`,
  }
})

// ── Helpers ────────────────────────────────────────────────────────────
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
