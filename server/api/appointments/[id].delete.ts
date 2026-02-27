export default defineEventHandler(async (event) => {
  await requireRole(event, [Roles.ADMIN])
  const id = getRouterParam(event, 'id')

  const appointment = await prisma.appointment.findUnique({ where: { id } })
  if (!appointment) throw createError({ statusCode: 404, statusMessage: 'Призначення не знайдено' })

  await prisma.appointment.delete({ where: { id } })
  return { message: 'Призначення успішно видалено' }
})
