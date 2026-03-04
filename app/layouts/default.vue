<script lang="ts" setup>
const { init, applyFor } = useTheme('client')
const { token, fetchUser, isAuthenticated } = useAuth()

onMounted(async () => {
  init()
  applyFor('client')

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
