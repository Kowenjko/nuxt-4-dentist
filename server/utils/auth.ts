import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'

const { jwtSecret } = useRuntimeConfig()

const JWT_SECRET = jwtSecret || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JwtPayload {
  userId: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer '))
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const token = authHeader.slice(7)
  try {
    return verifyToken(token)
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }
}

export async function requireRole(event: H3Event, roles: string[]) {
  const payload = await requireAuth(event)
  if (!roles.includes(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return payload
}

export async function getCurrentUser(event: H3Event) {
  const payload = await requireAuth(event)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
      doctorProfile: {
        select: {
          id: true,
          specialty: true,
          bio: true,
        },
      },
    },
  })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })
  return user
}
