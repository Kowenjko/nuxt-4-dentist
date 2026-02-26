<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const { login, loginWithGoogle, loading } = useAuth()

const formData = reactive({
  email: '',
  password: '',
})

const formError = ref('')
const redirectTo = (route.query.redirect as string) || '/'

// Ошибки переданные из /auth/callback или /api/auth/google/callback
const oauthErrors: Record<string, string> = {
  google_denied: 'Ви скасували вхід через Google.',
  token_failed: 'Помилка підключення до Google. Спробуйте ще раз.',
  userinfo_failed: 'Не вдалося отримати дані профілю Google.',
}
if (route.query.error) {
  formError.value = oauthErrors[route.query.error as string] || 'Помилка входу.'
}

const handleLogin = async () => {
  formError.value = ''
  try {
    await login(formData)
    navigateTo(redirectTo)
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Невірний email або пароль'
  }
}
</script>

<template>
  <AuthCard
    title="Вхід"
    description="Увійдіть, щоб керувати записами"
    :loading
    :formError
    @clickGoogle="loginWithGoogle(redirectTo)"
  >
    <form @submit.prevent="handleLogin">
      <BaseInput
        v-model="formData.email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autofocus
      />
      <BaseInput
        v-model="formData.password"
        label="Пароль"
        type="password"
        placeholder="••••••••"
        required
      />

      <BaseButton type="submit" :disabled="loading">
        {{ loading ? 'Вхід...' : 'Увійти' }}
      </BaseButton>
    </form>

    <p class="auth-footer">
      Немає облікового запису? <NuxtLink :to="REGISTER_LINK">Зареєструватися</NuxtLink>
    </p>
  </AuthCard>
</template>
<style>
.auth-footer {
  text-align: center;
  font-size: 13px;
  color: #7a7872;
  margin-top: 20px;
}
.auth-footer a {
  color: #1a3a2a;
  font-weight: 500;
  text-decoration: none;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>
