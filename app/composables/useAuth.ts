export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  const user = useState<any | null>('auth:user', () => null)
  const loading = ref(false)

  // Загрузить текущего пользователя по токену
  const fetchUser = async () => {
    if (!token.value) {
      user.value = null
      return
    }
    try {
      user.value = await $fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      })
    } catch {
      token.value = null
      user.value = null
    }
  }

  // Вход через email + пароль
  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const data = await $fetch<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      token.value = data.token
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  // Регистрация через email + пароль
  const register = async (body: {
    email: string
    password: string
    name: string
    phone?: string
    role?: string
  }) => {
    loading.value = true
    try {
      const data = await $fetch<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body,
      })
      token.value = data.token
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  // Вход/регистрация через Google OAuth
  // redirectAfter — куда вернуть пользователя после успешного входа
  const loginWithGoogle = (redirectAfter = '/') => {
    const params = new URLSearchParams({ redirect: redirectAfter })
    window.location.href = `/api/auth/google?${params}`
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isDoctor = computed(() => user.value?.role === 'DOCTOR')
  const isClient = computed(() => user.value?.role === 'CLIENT')

  return {
    token,
    user,
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
