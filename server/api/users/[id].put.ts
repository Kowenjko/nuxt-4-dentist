import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  // Users can only view their own profile unless admin
  // if (auth.userId !== id && auth.role !== 'ADMIN') {
  //   throw createError({ statusCode: 403, statusMessage: 'Заборонено' })
  // }

  const body = await readBody(event)
  const { name, phone, password, email, avatar } = body

  const data: any = {}
  if (name) data.name = name
  if (phone !== undefined) data.phone = phone
  if (email && auth.role === Roles.ADMIN) data.email = email
  if (avatar) data.avatar = avatar
  if (password) data.password = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  })

  return user
})
