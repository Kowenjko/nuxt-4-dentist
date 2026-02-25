// GET /api/auth/google?redirect=/dashboard
// Редиректит пользователя на страницу выбора Google аккаунта
export default defineEventHandler(async (event) => {
  const { appUrl, googleClientId: clientId } = useRuntimeConfig()
  if (!clientId) {
    throw createError({ statusCode: 500, statusMessage: 'GOOGLE_CLIENT_ID is not configured' })
  }

  const { redirect = '/' } = getQuery(event)
  const baseUrl = appUrl || 'http://localhost:3000'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: encodeURIComponent(redirect as string),
  })

  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302)
})
