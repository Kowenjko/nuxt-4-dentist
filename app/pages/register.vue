<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <span class="brand-cross">✚</span>
        <span>КлінікаПлюс</span>
        <button
          class="theme-toggle compact auth-theme-btn"
          @click="toggleTheme"
          :title="isDark ? 'Світла тема' : 'Темна тема'"
        >
          <span class="t-icon-light" v-if="isDark">☀️</span>
          <span class="t-icon-dark" v-else>🌙</span>
        </button>
      </div>

      <h1 class="auth-title">Реєстрація</h1>
      <p class="auth-sub">Створіть акаунт пацієнта</p>

      <button class="btn-google" @click="loginWithGoogle('/')" :disabled="loading">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
        Зареєструватись через Google
      </button>

      <div class="auth-divider"><span>або з email</span></div>

      <div v-if="formError" class="auth-alert">{{ formError }}</div>

      <form @submit.prevent="handleRegister" novalidate>
        <div class="auth-row">
          <div class="auth-fg">
            <label class="auth-fl" for="reg-name">Ім'я</label>
            <input
              id="reg-name"
              v-model="form.name"
              class="auth-fi"
              placeholder="Іван Іваненко"
              required
              autofocus
              autocomplete="name"
            />
          </div>
          <div class="auth-fg">
            <label class="auth-fl" for="reg-phone">
              Телефон <span class="auth-optional">(необов'язково)</span>
            </label>
            <input
              id="reg-phone"
              v-model="form.phone"
              type="tel"
              class="auth-fi"
              placeholder="+380 99 000 00 00"
              autocomplete="tel"
            />
          </div>
        </div>
        <div class="auth-fg">
          <label class="auth-fl" for="reg-email">Email</label>
          <input
            id="reg-email"
            v-model="form.email"
            type="email"
            class="auth-fi"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="auth-fg">
          <label class="auth-fl" for="reg-pass">Пароль</label>
          <input
            id="reg-pass"
            v-model="form.password"
            type="password"
            class="auth-fi"
            placeholder="Мінімум 8 символів"
            required
            minlength="8"
            autocomplete="new-password"
          />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="auth-spinner" />
          {{ loading ? 'Створення...' : 'Створити акаунт' }}
        </button>
      </form>

      <p class="auth-footer">Вже є акаунт? <NuxtLink to="/login">Увійти</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { isDark, toggle: toggleTheme, init: initTheme, applyFor } = useTheme('client')
onMounted(() => {
  initTheme()
  applyFor('client')
})

const { register, loginWithGoogle, loading } = useAuth()
const form = ref({ name: '', email: '', phone: '', password: '' })
const formError = ref('')

const handleRegister = async () => {
  formError.value = ''
  try {
    await register({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || undefined,
      password: form.value.password,
      role: 'CLIENT',
    })
    navigateTo('/')
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка реєстрації'
  }
}
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
.auth-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-modal);
  transition:
    background var(--duration-base),
    border-color var(--duration-base);
}
.auth-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 32px;
}
.brand-cross {
  font-size: 20px;
  color: var(--accent);
  flex-shrink: 0;
}
.auth-theme-btn {
  margin-left: auto;
}
.auth-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}
.auth-sub {
  font-size: 13px;
  color: var(--text-3);
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
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all var(--duration-fast);
}
.btn-google:hover:not(:disabled) {
  border-color: var(--border-2);
  background: var(--bg-2);
  box-shadow: var(--shadow-sm);
}
.btn-google:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
.auth-divider span {
  font-size: 12px;
  color: var(--text-4);
}
.auth-alert {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger-border);
  margin-bottom: 16px;
  line-height: 1.5;
}
.auth-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 480px) {
  .auth-row {
    grid-template-columns: 1fr;
  }
  .auth-card {
    padding: 28px 20px;
    border-radius: 12px;
  }
}
.auth-fg {
  margin-bottom: 14px;
}
.auth-fl {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.auth-optional {
  font-weight: 400;
  color: var(--text-4);
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
}
.auth-fi {
  width: 100%;
  height: 40px;
  padding: 0 13px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--bg-2);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition:
    border-color var(--duration-fast),
    background var(--duration-fast);
}
.auth-fi:focus {
  border-color: var(--border-focus);
  background: var(--surface);
}
.auth-fi::placeholder {
  color: var(--text-4);
}
.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  background: var(--accent);
  color: var(--text-inv);
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
  margin-top: 4px;
  box-shadow: var(--shadow-accent);
}
.btn-submit:hover:not(:disabled) {
  background: var(--accent-2);
  transform: translateY(-1px);
}
.btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.auth-spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  animation: auth-spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes auth-spin {
  to {
    transform: rotate(360deg);
  }
}
.auth-footer {
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
  margin-top: 20px;
}
.auth-footer a {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>
