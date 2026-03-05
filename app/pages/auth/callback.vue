<script setup lang="ts">
definePageMeta({ layout: false })

const { init: initTheme, applyFor } = useTheme('client')
const { fetchUser } = useAuth()
const route = useRoute()

const errorMsg = ref('')

const errorMessages: Record<string, string> = {
  google_denied: 'Ви скасували вхід через Google.',
  token_exchange_failed: 'Помилка підключення до Google. Спробуйте ще раз.',
  userinfo_failed: 'Не вдалось отримати дані профілю Google.',
  missing_code: 'Некоректна відповідь від Google.',
}

onMounted(async () => {
  initTheme()
  applyFor('client')

  const err = route.query.error as string
  const redirectTo = (route.query.redirect as string) || '/'

  // ── Помилка від OAuth ────────────────────────────────────────────────
  if (err) {
    errorMsg.value = errorMessages[err] || 'Виникла помилка при вході через Google.'
    return
  }

  // ── Успіх: сервер вже встановив httpOnly cookie 'auth_token' ────────
  // Підвантажуємо юзера — fetchUser() надішле запит на /api/auth/me,
  // браузер автоматично додасть httpOnly cookie до запиту.
  try {
    await fetchUser()
  } catch (e) {
    // Якщо fetchUser провалився — щось не так з cookie
    console.error('[callback] fetchUser failed:', e)
    errorMsg.value = 'Не вдалось завершити вхід. Спробуйте ще раз.'
    return
  }

  await navigateTo(redirectTo, { replace: true })
})
</script>

<template>
  <div class="auth-page">
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

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  padding: 20px;
}
.callback-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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
.callback-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-modal);
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
}
.cb-back:hover {
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
