export default defineEventHandler(async (event) => {
  await requireRole(event, [Roles.ADMIN])
  const id = getRouterParam(event, 'id')

  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) throw createError({ statusCode: 404, statusMessage: 'Послуга не знайдена' })

  await prisma.service.delete({ where: { id } })
  return { message: 'Послугу успішно видалено' }
})
