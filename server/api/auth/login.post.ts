import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Потрібні електронна адреса та пароль' })

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      doctorProfile: { select: { id: true, specialty: true } },
    },
  })

  // User registered via Google only — has no password
  if (user && !user.password) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Цей обліковий запис використовує Google Sign-In. Будь ласка, увійдіть через Google.',
    })
  }

  if (!user || !(await bcrypt.compare(password, user.password!))) {
    throw createError({ statusCode: 401, statusMessage: 'Невірні облікові дані' })
  }

  const token = signToken({ userId: user.id, role: user.role })

  const { password: _pw, googleId: _gid, ...userWithoutSensitive } = user
  return { token, user: userWithoutSensitive }
})
