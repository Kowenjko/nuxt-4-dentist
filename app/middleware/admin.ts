// Защищает /admin/* маршруты — только для пользователей с ролью ADMIN.
// Использование на странице: definePageMeta({ middleware: 'admin' })

export default defineNuxtRouteMiddleware(async () => {
  const { token, fetchUser, isAuthenticated, isAdmin } = useAuth()

  if (token.value && !isAuthenticated.value) {
    await fetchUser()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }

  if (!isAdmin.value) {
    return navigateTo('/admin/login')
  }
})
