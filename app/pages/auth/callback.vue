<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()

const errorMessages: Record<string, string> = {
  google_denied: 'Вы отменили вход через Google.',
  token_failed: 'Не удалось получить данные от Google. Попробуйте ещё раз.',
  userinfo_failed: 'Не удалось получить профиль Google. Попробуйте ещё раз.',
}

const errorMsg = ref('')

onMounted(() => {
  const err = route.query.error as string
  const token = route.query.token as string
  const redirectTo = (route.query.redirect as string) || '/'

  // Пришла ошибка из callback
  if (err) {
    errorMsg.value = errorMessages[err] || 'Произошла ошибка при входе.'
    return
  }

  if (!token) {
    errorMsg.value = 'Токен не получен. Попробуйте войти снова.'
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
  <div class="callback-page">
    <!-- Ошибка от Google -->
    <div v-if="errorMsg" class="error-box">
      <div class="error-icon">✕</div>
      <p class="error-text">{{ errorMsg }}</p>
      <NuxtLink to="/auth/login" class="back-link">← Вернуться к входу</NuxtLink>
    </div>

    <!-- Загрузка -->
    <div v-else class="loading-box">
      <div class="spinner" />
      <p>Выполняем вход...</p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  font-family: 'DM Sans', sans-serif;
  padding: 20px;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--text-secondary);
  font-size: 15px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  background: var(--bg-card);
  border: 1px solid var(--border-error);
  border-radius: 12px;
  padding: 36px 40px;
  max-width: 380px;
  text-align: center;
  box-shadow: var(--shadow-card-soft);
}

.error-icon {
  width: 44px;
  height: 44px;
  background: var(--bg-error);
  color: var(--text-error);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin: 0 auto 16px;
}

.error-text {
  font-size: 14px;
  color: var(--text-body);
  margin-bottom: 20px;
  line-height: 1.5;
}

.back-link {
  font-size: 13px;
  color: var(--text-brand);
  font-weight: 500;
  text-decoration: none;
}
.back-link:hover {
  text-decoration: underline;
}
</style>
