<script lang="ts" setup>
import { Toaster } from 'vue-sonner'

const { htmlAttrs } = useTheme()

useHead({
  htmlAttrs: htmlAttrs.value,
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
