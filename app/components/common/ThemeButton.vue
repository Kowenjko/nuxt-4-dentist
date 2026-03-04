<script lang="ts" setup>
import { Moon, Sun } from 'lucide-vue-next'
const {
  isDark,
  isLabel = false,
  variant = 'line',
} = defineProps<{
  isDark: boolean
  isLabel?: boolean
  variant?: 'outline' | 'line'
}>()

const title = computed(() => (isDark ? 'Світла тема' : 'Темна тема'))
</script>

<template>
  <Button :variant :title="title">
    <Sun v-if="isDark" />
    <Moon v-else />
    <span v-if="isLabel" class="btn-label">{{ title }}</span>
  </Button>
</template>
<style scoped>
.btn-label {
  font-size: 15px;
  font-weight: 500;
}
</style>
