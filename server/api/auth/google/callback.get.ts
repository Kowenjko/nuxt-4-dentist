interface GoogleTokens {
  access_token: string
  id_token: string
  expires_in: number
}

interface GoogleUser {
  sub: string // уникальный Google ID
  email: string
  name: string
  picture?: string
  email_verified: boolean
}

// GET /api/auth/google/callback
// Google редиректит сюда после того как пользователь выбрал аккаунт
export default defineEventHandler(async (event) => {
  const {
    appBaseUrl,
    googleClientId: clientId,
    googleClientSecret: clientSecret,
  } = useRuntimeConfig()

  const { code, state, error } = getQuery(event)
  const appUrl = appBaseUrl || 'http://localhost:3000'

  // Пользователь нажал "Отмена" на странице Google
  if (error || !code) {
    return sendRedirect(event, `${appUrl}/auth/login?error=google_denied`, 302)
  }

  // Шаг 1: меняем code на access_token
  let tokens: GoogleTokens
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })
    tokens = await res.json()
    if (!tokens.access_token) throw new Error('No access_token')
  } catch (e) {
    console.error('[Google OAuth] Token exchange failed:', e)
    return sendRedirect(event, `${appUrl}/auth/login?error=token_failed`, 302)
  }

  // Шаг 2: получаем профиль пользователя из Google
  let googleUser: GoogleUser
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    googleUser = await res.json()
    if (!googleUser.email_verified) throw new Error('Email not verified')
  } catch (e) {
    console.error('[Google OAuth] Userinfo failed:', e)
    return sendRedirect(event, `${appUrl}/auth/login?error=userinfo_failed`, 302)
  }

  // Шаг 3: upsert пользователя в БД
  // Ищем сначала по googleId, потом по email (мог уже зарегистрироваться через email)
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: googleUser.sub }, { email: googleUser.email }],
    },
  })

  if (user) {
    // Привязываем Google к существующему email-аккаунту
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatar: googleUser.picture ?? user.avatar,
        },
      })
    }
  } else {
    // Новый пользователь — создаём с ролью CLIENT
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.sub,
        avatar: googleUser.picture ?? null,
        role: 'CLIENT',
        // password = null, Google-пользователи входят только через Google
      },
    })
  }

  // Шаг 4: выдаём JWT и редиректим на фронтенд
  const token = signToken({ userId: user.id, role: user.role })
  const redirectTo = state ? decodeURIComponent(state as string) : '/'

  return sendRedirect(
    event,
    `${appUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(redirectTo)}`,
    302
  )
})
