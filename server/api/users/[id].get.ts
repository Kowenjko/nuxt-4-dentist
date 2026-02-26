export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  // Users can only view their own profile unless admin
  if (auth.userId !== id && auth.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Заборонено' })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true,
      doctorProfile: {
        select: {
          id: true,
          specialty: true,
          bio: true,
          services: { select: { id: true, name: true, duration: true, price: true } },
        },
      },
    },
  })

  if (!user) throw createError({ statusCode: 404, statusMessage: 'Користувач не знайдений' })
  return user
})
