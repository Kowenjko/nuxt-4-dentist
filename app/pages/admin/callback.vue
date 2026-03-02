<template>
  <div class="auth-page">
    <!-- Помилка від Google -->
    <div v-if="errorMsg" class="callback-card">
      <div class="cb-error-icon">✕</div>
      <p class="cb-title">Помилка входу</p>
      <p class="cb-text">{{ errorMsg }}</p>
      <NuxtLink to="/login" class="cb-back">← Повернутись до входу</NuxtLink>
    </div>

    <!-- Завантаження -->
    <div v-else class="callback-loading">
      <div class="cb-spinner" />
      <p class="cb-loading-text">Виконуємо вхід...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { init: initTheme, applyFor } = useTheme('client')
onMounted(() => {
  initTheme()
  applyFor('client')
})

const route = useRoute()

const errorMessages: Record<string, string> = {
  google_denied: 'Ви скасували вхід через Google.',
  token_failed: 'Не вдалося отримати дані від Google. Спробуйте ще раз.',
  userinfo_failed: 'Не вдалося отримати профіль Google. Спробуйте ще раз.',
}

const errorMsg = ref('')

onMounted(() => {
  initTheme()
  applyFor('client')

  const err = route.query.error as string
  const token = route.query.token as string
  const redirectTo = (route.query.redirect as string) || '/'

  if (err) {
    errorMsg.value = errorMessages[err] || 'Виникла помилка при вході.'
    return
  }
  if (!token) {
    errorMsg.value = 'Токен не отримано. Спробуйте увійти знову.'
    return
  }

  const authToken = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })
  authToken.value = token
  navigateTo(redirectTo, { replace: true })
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  padding: 20px;
  transition: background var(--duration-base);
}

/* Loading state */
.callback-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-3);
  font-size: 15px;
  animation: cb-fade-in 0.4s both;
}
.cb-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid var(--border-2);
  border-top-color: var(--accent);
  animation: cb-spin 0.7s linear infinite;
}
.cb-loading-text {
  color: var(--text-3);
  font-size: 15px;
}

/* Error card */
.callback-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-modal);
  transition:
    background var(--duration-base),
    border-color var(--duration-base);
  animation: cb-slide-up 0.4s var(--ease) both;
}
.cb-error-icon {
  width: 48px;
  height: 48px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0 auto 20px;
  border: 1px solid var(--danger-border);
}
.cb-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 10px;
}
.cb-text {
  font-size: 14px;
  color: var(--text-3);
  line-height: 1.6;
  margin-bottom: 24px;
}
.cb-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
  transition: gap var(--duration-fast);
}
.cb-back:hover {
  gap: 10px;
  text-decoration: underline;
}

@keyframes cb-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes cb-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes cb-slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
