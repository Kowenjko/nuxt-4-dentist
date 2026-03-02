<script lang="ts" setup>
const { isDark, toggle, init, applyFor } = useTheme('client')
onMounted(() => {
  init()
  applyFor('client')
})
</script>

<template>
  <main>
    <slot />
  </main>
  <BookingModal />
  <AppointmentsList />
</template>
