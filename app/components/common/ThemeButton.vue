<script lang="ts" setup>
import { MoonIcon, SunIcon } from 'lucide-vue-next'
const {
  isDark,
  isLabel = false,
  variant = 'ghost',
} = defineProps<{
  isDark: boolean
  isLabel?: boolean
  variant?: 'outline' | 'ghost'
}>()

const title = computed(() => (isDark ? 'Світла тема' : 'Темна тема'))
</script>

<template>
  <Button :variant :title="title">
    <SunIcon v-if="isDark" />
    <MoonIcon v-else />
    <span v-if="isLabel" class="btn-label">{{ title }}</span>
  </Button>
</template>
<style scoped>
.btn-label {
  font-size: 15px;
  font-weight: 500;
}
</style>
