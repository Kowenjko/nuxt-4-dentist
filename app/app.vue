<script lang="ts" setup>
import { Toaster } from 'vue-sonner'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Dentist` : 'Dentist'
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster position="top-right" richColors />
  </ClientOnly>
</template>
