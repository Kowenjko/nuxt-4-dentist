<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()

const errorMessages: Record<string, string> = {
  google_denied: 'Ви скасували вхід через Google.',
  token_failed: 'Не вдалося отримати дані від Google. Спробуйте ще раз.',
  userinfo_failed: 'Не вдалося отримати профіль Google. Спробуйте ще раз.',
}

const errorMsg = ref('')

onMounted(() => {
  const err = route.query.error as string
  const token = route.query.token as string
  const redirectTo = (route.query.redirect as string) || '/'

  // Пришла ошибка из callback
  if (err) {
    errorMsg.value = errorMessages[err] || 'Сталася помилка при вході.'
    return
  }

  if (!token) {
    errorMsg.value = 'Токен не отримано. Спробуйте увійти знову'
    return
  }

  // Сохраняем JWT в cookie (7 дней)
  const authToken = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })
  authToken.value = token

  navigateTo(redirectTo, { replace: true })
})
</script>

<template>
  <GoogleErrorMessage v-if="errorMsg" :errorMsg="errorMsg" />

  <!-- Загрузка -->
  <div v-else class="loading-box">
    <Spinner />
    <p>Виконуємо вхід...</p>
  </div>
</template>

<style scoped>
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--text-secondary);
  font-size: 15px;
}
</style>
