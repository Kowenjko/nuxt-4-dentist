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
  const clean = token?.trim()
  if (!clean) {
    throw createError({ statusCode: 401, statusMessage: 'Несанкціонований' })
  }
  try {
    return jwt.verify(clean, JWT_SECRET) as JwtPayload
  } catch (err: any) {
    const preview = clean.length > 20 ? `${clean.slice(0, 10)}...${clean.slice(-6)}` : '[short]'
    console.error(`[auth] verifyToken failed for token ${preview}:`, err.name, err.message)
    throw createError({ statusCode: 401, statusMessage: 'Недійсний або прострочений токен' })
  }
}

/**
 * Порядок пошуку токена:
 *   1. Authorization: Bearer <token>  — email login ($fetch з фронту)
 *   2. Cookie: auth_token (httpOnly)  — Google OAuth (встановлюється сервером)
 *
 * Обидва шляхи валідні. httpOnly cookie браузер надсилає автоматично —
 * JS його не бачить, але H3 getCookie() читає з request headers.
 */
function extractToken(event: H3Event): string | null {
  // 1. Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) {
    const trimmed = authHeader.trim()
    if (trimmed.toLowerCase().startsWith('bearer ')) {
      const t = cleanToken(trimmed.slice(7))
      if (t) return t
    } else {
      // Без "Bearer " префіксу
      const t = cleanToken(trimmed)
      if (t) return t
    }
  }

  // 2. Cookie auth_token
  const cookieToken = getCookie(event, 'auth_token')
  if (cookieToken) {
    const t = cleanToken(cookieToken)
    if (t) return t
  }

  return null
}

/**
 * Прибирає зайві символи навколо токена.
 * Деякі клієнти або браузери можуть додавати лапки або пробіли.
 * JWT складається лише з Base64url символів та крапок — нічого зайвого.
 */
function cleanToken(raw: string): string | null {
  // Прибираємо пробіли та лапки (одинарні/подвійні) з обох боків
  const cleaned = raw.trim().replace(/^["']+|["']+$/g, '')
  // JWT повинен мати рівно 2 крапки (header.payload.signature)
  if (cleaned.split('.').length !== 3) return null
  return cleaned
}

export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  const token = extractToken(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Несанкціонований' })
  }
  return verifyToken(token)
}

export async function requireRole(event: H3Event, roles: string[]) {
  const payload = await requireAuth(event)
  if (!roles.includes(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Доступ заборонено' })
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
        select: { id: true, specialty: true, bio: true },
      },
    },
  })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Користувача не знайдено' })
  return user
}
