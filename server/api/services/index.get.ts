export default defineEventHandler(async (event) => {
  const { search } = getQuery(event)

  const where: any = {}
  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' }
  }

  const services = await prisma.service.findMany({
    where,
    include: {
      doctors: {
        select: {
          id: true,
          specialty: true,
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return services
})
