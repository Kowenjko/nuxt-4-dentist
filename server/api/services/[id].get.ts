export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      doctors: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  })

  if (!service) throw createError({ statusCode: 404, statusMessage: 'Послуга не знайдена' })
  return service
})
