<script setup lang="ts">
const route = useRoute()
const { login, loginWithGoogle, loading } = useAuth()

const formData = reactive({
  email: '',
  password: '',
})
const formError = ref('')
const redirectTo = (route.query.redirect as string) || '/'

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

definePageMeta({ layout: 'auth' })
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
      <AuthInput
        v-model="formData.email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        required
        autofocus
      />
      <AuthInput
        v-model="formData.password"
        label="Пароль"
        type="password"
        placeholder="••••••••"
        required
        autocomplete="current-password"
      />

      <Button type="submit" :disabled="loading" style="width: 100%" size="lg">
        <Spinner v-if="loading" />
        {{ loading ? 'Вхід...' : 'Увійти' }}
      </Button>
    </form>

    <template #footer>
      Немає акаунту? <NuxtLink :to="REGISTER_LINK">Зареєструватися</NuxtLink>
    </template>
  </AuthCard>
</template>
