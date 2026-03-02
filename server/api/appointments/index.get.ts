export default defineEventHandler(async (event) => {
  //const auth = await requireAuth(event)
  const { status, from, to, page = '1', limit = '20' } = getQuery(event)

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const where: any = {}

  // Filter by role: clients see own, doctors see own, admins see all
  // if (auth.role === Roles.CLIENT) {
  //   where.clientId = auth.userId
  // } else if (auth.role === Roles.DOCTOR) {
  //   const doctorProfile = await prisma.doctorProfile.findUnique({
  //     where: { userId: auth.userId },
  //   })
  //   if (doctorProfile) where.doctorId = doctorProfile.id
  // }

  if (status) where.status = status
  if (from || to) {
    where.startTime = {}
    if (from) where.startTime.gte = new Date(from as string)
    if (to) where.startTime.lte = new Date(to as string)
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        client: { select: { id: true, name: true, phone: true, avatar: true, email: true } },
        doctor: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.appointment.count({ where }),
  ])

  return {
    data: appointments,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  }
})
