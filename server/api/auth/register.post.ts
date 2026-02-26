import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name, phone, role } = body

  if (!email || !password || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Необхідно вказати електронну адресу, пароль та ім'я",
    })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Пароль має містити принаймні 8 символів' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    // Account exists via Google — suggest login with Google instead
    if (existing.googleId && !existing.password) {
      throw createError({
        statusCode: 409,
        statusMessage:
          "Цей email пов'язаний з обліковим записом Google. Будь ласка, увійдіть через Google.",
      })
    }
    throw createError({ statusCode: 409, statusMessage: 'Електронна адреса вже використовується' })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role: role === 'DOCTOR' ? 'DOCTOR' : 'CLIENT',
      // Auto-create doctor profile if role is DOCTOR
      ...(role === 'DOCTOR' && {
        doctorProfile: {
          create: {
            specialty: body.specialty || 'Стоматолог',
            bio: body.bio || null,
          },
        },
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
      doctorProfile: { select: { id: true, specialty: true } },
    },
  })

  const token = signToken({ userId: user.id, role: user.role })

  return { token, user }
})
