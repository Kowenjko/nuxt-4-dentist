import { useUsersStore } from '@/stores/users'

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  const usersStore = useUsersStore()
  const loading = ref(false)

  const authAction = async <T>(action: () => Promise<T>) => {
    loading.value = true
    try {
      const response = (await action()) as UserResponseI

      usersStore.user = response?.user
      token.value = response?.token
      return response
    } finally {
      loading.value = false
    }
  }

  // Загрузить текущего пользователя по токену
  const fetchUser = async () => {
    if (!token.value) {
      usersStore.user = null
      return
    }
    try {
      usersStore.user = authAPI.me() as unknown as UserI
    } catch {
      token.value = null
      usersStore.user = null
    }
  }

  // Вход через email + пароль
  const login = (body: LoginI) => authAction(() => authAPI.login(body))
  // Регистрация через email + пароль
  const register = (body: RegisterI) => authAction(() => authAPI.register(body))

  // Вход/регистрация через Google OAuth
  // redirectAfter — куда вернуть пользователя после успешного входа
  const loginWithGoogle = (redirectAfter = '/') => {
    const params = new URLSearchParams({ redirect: redirectAfter })
    window.location.href = `/api/auth/google?${params}`
  }

  const logout = () => {
    token.value = null
    usersStore.user = null
    navigateTo(LOGIN_LINK)
  }

  const isAuthenticated = computed(() => !!token.value && !!usersStore.user)
  const isAdmin = computed(() => usersStore.user?.role === Roles.ADMIN)
  const isDoctor = computed(() => usersStore.user?.role === Roles.DOCTOR)
  const isClient = computed(() => usersStore.user?.role === Roles.CLIENT)

  return {
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isDoctor,
    isClient,
    fetchUser,
    login,
    register,
    loginWithGoogle,
    logout,
  }
}
