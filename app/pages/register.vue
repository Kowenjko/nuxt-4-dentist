<script setup lang="ts">
const { register, loginWithGoogle, loading } = useAuth()

const formData = reactive({ name: '', email: '', phone: '', password: '' })
const formError = ref('')

const handleRegister = async () => {
  formError.value = ''
  try {
    await register({ ...formData, role: Roles.CLIENT })
    navigateTo(HOME_LINK)
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Помилка реєстрації'
  }
}

definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthCard
    title="Реєстрація"
    description="Створіть акаунт пацієнта"
    :loading
    :formError
    textGoogle="Зареєструватися через Google"
    @clickGoogle="loginWithGoogle('/')"
  >
    <form @submit.prevent="handleRegister">
      <AuthInput
        v-model="formData.name"
        label="Фамілія Ім'я"
        placeholder="Фамілія Ім'я"
        required
        autofocus
        autocomplete="name"
      />
      <AuthInput
        v-model="formData.email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autofocus
        autocomplete="email"
      />
      <AuthInput
        v-model="formData.phone"
        label="Телефон"
        type="tel"
        placeholder="+380 99 000 00 00"
        autocomplete="tel"
      />
      <AuthInput
        v-model="formData.password"
        label="Пароль"
        type="password"
        placeholder="Мінімум 8 символів"
        minlength="8"
        required
        autocomplete="new-password"
      />

      <Button type="submit" :disabled="loading" style="width: 100%" size="lg">
        <Spinner v-if="loading" />
        {{ loading ? 'Створення...' : 'Створити акаунт' }}
      </Button>
    </form>

    <template #footer> Вже є акаунт? <NuxtLink :to="LOGIN_LINK">Увійти</NuxtLink> </template>
  </AuthCard>
</template>
