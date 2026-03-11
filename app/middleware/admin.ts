export default defineNuxtRouteMiddleware(async () => {
  const { token, fetchUser, isAuthenticated, isAdmin } = useAuth()
  // if (token.value && !isAuthenticated.value) await fetchUser()

  // console.log(token.value)
  // if (!isAuthenticated.value || !isAdmin.value) return navigateTo('/login')
})
