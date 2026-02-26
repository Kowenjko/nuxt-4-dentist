<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register, loginWithGoogle, loading } = useAuth()

const formData = reactive({ name: '', email: '', phone: '', password: '' })
const formError = ref('')

const handleRegister = async () => {
  formError.value = ''
  try {
    await register({ ...formData, role: 'CLIENT' })
    navigateTo(HOME_LINK)
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка реєстрації'
  }
}
</script>

<template>
  <AuthCard
    title="Реєстрація"
    description="Створіть обліковий запис пацієнта"
    :loading
    :formError
    textGoogle="Зареєструватися через Google"
    @clickGoogle="loginWithGoogle('/')"
  >
    <form @submit.prevent="handleRegister">
      <BaseInput
        v-model="formData.name"
        label="Фамілія Ім'я"
        placeholder="Фамілія Ім'я"
        required
        autofocus
      />
      <BaseInput
        v-model="formData.email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autofocus
      />
      <BaseInput
        v-model="formData.phone"
        label="Телефон"
        type="tel"
        placeholder="+380 99 000 00 00"
      />
      <BaseInput
        v-model="formData.password"
        label="Пароль"
        type="password"
        placeholder="Мінімум 8 символів"
        minlength="8"
        required
      />

      <BaseButton type="submit" :disabled="loading">
        {{ loading ? 'Створення облікового запису...' : 'Створити обліковий запис' }}
      </BaseButton>
    </form>

    <p class="auth-footer">
      Вже маєте обліковий запис? <NuxtLink :to="LOGIN_LINK">Увійти</NuxtLink>
    </p>
  </AuthCard>
</template>

<style scoped>
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
