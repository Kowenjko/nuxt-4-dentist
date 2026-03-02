export default defineNuxtRouteMiddleware(async () => {
  const { token, fetchUser, isAuthenticated, isAdmin } = useAuth()
  // if (token.value && !isAuthenticated.value) await fetchUser()
  // if (!isAuthenticated.value || !isAdmin.value) return navigateTo('/admin/login')
})
