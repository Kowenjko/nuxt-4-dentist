<script lang="ts" setup>
const { init, applyFor } = useTheme('client')
const { token, fetchUser, isAuthenticated } = useAuth()

onMounted(async () => {
  init()
  applyFor('client')
  // Загружаем пользователя если токен есть но user ещё не загружен
  if (!isAuthenticated.value) {
    await fetchUser()
  }
})
</script>

<template>
  <Header />
  <main>
    <slot />
  </main>
  <BookingModal />
  <AppointmentsList />
</template>
