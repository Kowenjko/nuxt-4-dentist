// Защищает маршруты от неавторизованных пользователей.
// Использование на странице: definePageMeta({ middleware: 'auth' })

export default defineNuxtRouteMiddleware(async (to) => {
  const { token, fetchUser, isAuthenticated } = useAuth()

  // Загружаем пользователя если токен есть но user ещё не загружен
  if (token.value && !isAuthenticated.value) {
    await fetchUser()
  }

  if (!isAuthenticated.value) {
    return navigateTo({
      ...LOGIN_LINK,
      query: { redirect: encodeURIComponent(to.fullPath) },
    })
  }
})
