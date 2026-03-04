<script lang="ts" setup>
import { PlusIcon } from 'lucide-vue-next'

const { isDarkText = false } = defineProps<{ isDarkText?: boolean }>()
</script>

<template>
  <NuxtLink :to="HOME_LINK" class="brand" v-bind="$attrs">
    <PlusIcon class="brand-cross" />
    <span :class="{ 'brand-dark': isDarkText }">{{ COMPANY_NAME }}</span>
  </NuxtLink>
</template>
<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--font-sans);
  font-size: 19px;
  color: var(--ink);
  flex-shrink: 0;
  transition: all 0.3s;
  &:hover {
    color: var(--g1);
  }
}

.brand em {
  font-style: normal;
  color: var(--g1);
}
.brand-cross {
  color: var(--g1);
  flex-shrink: 0;
  stroke-width: 4px;
}

.brand-dark {
  color: var(--black-50);
}
</style>
