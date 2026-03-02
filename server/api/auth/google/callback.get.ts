interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
}

interface GoogleUserInfo {
  sub: string // Google user ID
  email: string
  name: string
  picture?: string
  email_verified: boolean
}

// GET /api/auth/google/callback
// Google redirects here after user grants permission.
export default defineEventHandler(async (event) => {
  const {
    appBaseUrl,
    googleClientId: clientId,
    googleClientSecret: clientSecret,
  } = useRuntimeConfig()

  const { code, state, error } = getQuery(event)
  const appUrl = appBaseUrl || 'http://localhost:3000'

  // User denied access
  if (error) {
    return sendRedirect(event, `${appUrl}/login?error=google_denied`, 302)
  }

  if (!code) {
    return sendRedirect(event, `${appUrl}/login?error=missing_code`, 302)
  }

  // Exchange authorization code for tokens
  let tokens: GoogleTokenResponse
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
    if (!tokens.access_token) throw new Error('No access_token in response')
  } catch (e) {
    console.error('Google token exchange failed:', e)
    return sendRedirect(event, `${appUrl}/login?error=token_exchange_failed`, 302)
  }

  // Fetch user info from Google
  let googleUser: GoogleUserInfo
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    googleUser = await res.json()
    if (!googleUser.email_verified) throw new Error('Email not verified')
  } catch (e) {
    console.error('Google userinfo failed:', e)
    return sendRedirect(event, `${appUrl}/login?error=userinfo_failed`, 302)
  }

  // Upsert user: find by googleId or email, then link/create
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: googleUser.sub }, { email: googleUser.email }],
    },
  })

  if (user) {
    // Link Google account if user registered via email before
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
    // New user — register automatically as CLIENT
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.sub,
        avatar: googleUser.picture ?? null,
        role: Roles.CLIENT,
        // password = null, Google-пользователи входят только через Google
      },
    })
  }

  // Issue JWT
  const token = signToken({ userId: user.id, role: user.role })

  // Встановлюємо httpOnly cookie прямо на сервері —
  // безпечніше ніж передавати токен у URL (захист від referer leakage)
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 днів
    path: '/',
  })

  // Редиректимо на /auth/callback БЕЗ токена в URL
  // callback.vue побачить відсутність ?error і просто зробить fetchUser() + navigateTo
  const redirectTo = state ? decodeURIComponent(state as string) : '/'
  return sendRedirect(
    event,
    `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
    302
  )
})
