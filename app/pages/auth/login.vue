<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { login, loginWithGoogle, loading } = useAuth()

const email = ref('')
const password = ref('')
const formError = ref('')
const redirectTo = (route.query.redirect as string) || '/'

// Ошибки переданные из /auth/callback или /api/auth/google/callback
const oauthErrors: Record<string, string> = {
  google_denied: 'Вы отменили вход через Google.',
  token_failed: 'Ошибка соединения с Google. Попробуйте снова.',
  userinfo_failed: 'Не удалось получить данные профиля Google.',
}
if (route.query.error) {
  formError.value = oauthErrors[route.query.error as string] || 'Ошибка входа.'
}

const handleLogin = async () => {
  formError.value = ''
  try {
    await login({ email: email.value, password: password.value })
    navigateTo(redirectTo)
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Неверный email или пароль'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <span class="brand-cross">✚</span>
        <span>МедЦентр</span>
      </div>

      <h1 class="auth-title">Вход</h1>
      <p class="auth-sub">Войдите, чтобы управлять записями</p>

      <!-- Google button -->
      <button class="btn-google" @click="loginWithGoogle(redirectTo)" :disabled="loading">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        Войти через Google
      </button>

      <div class="divider"><span>или</span></div>

      <div v-if="formError" class="alert alert-error">{{ formError }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
            autofocus
          />
        </div>
        <div class="form-group">
          <label class="form-label">Пароль</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <p class="auth-footer">
        Нет аккаунта? <NuxtLink :to="REGISTER_LINK">Зарегистрироваться</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-page {
  min-height: 100vh;
  background: #f5f4f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  padding: 20px;
}

.auth-card {
  background: white;
  border: 1px solid #e4e2dc;
  border-radius: 14px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a3a2a;
  margin-bottom: 32px;
}
.brand-cross {
  font-size: 20px;
  color: #2e7d52;
}

.auth-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1917;
}
.auth-sub {
  font-size: 13px;
  color: #7a7872;
  margin-top: 4px;
  margin-bottom: 24px;
}

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1.5px solid #e4e2dc;
  border-radius: 8px;
  background: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #1a1917;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-google:hover:not(:disabled) {
  border-color: #bbb;
  background: #fafaf8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e4e2dc;
}
.divider span {
  font-size: 12px;
  color: #aaa;
}

.alert {
  padding: 10px 14px;
  border-radius: 7px;
  font-size: 13px;
  margin-bottom: 16px;
}
.alert-error {
  background: #fdf0ee;
  color: #c0392b;
}

.form-group {
  margin-bottom: 14px;
}
.form-label {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: #7a7872;
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #e4e2dc;
  border-radius: 7px;
  font-family: inherit;
  font-size: 14px;
  color: #1a1917;
  outline: none;
  transition: border-color 0.15s;
}
.form-input:focus {
  border-color: #1a3a2a;
}

.btn-submit {
  width: 100%;
  padding: 10px;
  background: #1a3a2a;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.btn-submit:hover:not(:disabled) {
  background: #152e21;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
