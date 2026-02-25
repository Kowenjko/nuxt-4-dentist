import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })

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
      statusMessage: 'This account uses Google Sign-In. Please login with Google.',
    })
  }

  if (!user || !(await bcrypt.compare(password, user.password!))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = signToken({ userId: user.id, role: user.role })

  const { password: _pw, googleId: _gid, ...userWithoutSensitive } = user
  return { token, user: userWithoutSensitive }
})
