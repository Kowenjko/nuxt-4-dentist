export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const auth = await requireAuth(event)

  // Users can only view their own profile unless admin
  if (auth.userId !== id && auth.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Заборонено' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Користувач не знайдений' })

  await prisma.user.delete({ where: { id } })

  return { message: 'Користувач успішно видалений' }
})
