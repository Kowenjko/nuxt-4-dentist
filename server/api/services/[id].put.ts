export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')

  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Послуга не знайдена' })

  const body = await readBody(event)
  const { name, duration, price } = body

  const data: any = {}
  if (name) data.name = name
  if (duration) data.duration = parseInt(duration)
  if (price !== undefined) data.price = price

  return prisma.service.update({ where: { id }, data })
})
