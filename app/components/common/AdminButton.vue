<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm'
  variant?: 'primary' | 'danger' | 'ghost'
  to?: RouteLocationRaw
}

const { type = 'button', variant = 'primary', size = '' } = defineProps<Props>()

const btn = computed(() => {
  let classes = 'btn'
  if (variant) classes += ` btn-${variant}`
  if (size) classes += ` btn-${size}`

  return classes
})
</script>

<template>
  <nuxt-link v-if="to" :to="to" :class="btn" v-bind="$attrs"><slot /></nuxt-link>
  <button v-else :type :class="btn" v-bind="$attrs">
    <slot />
  </button>
</template>
<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
  text-decoration: none;
}
.btn svg {
  width: 14px;
  height: 14px;
}
.btn-primary {
  background: var(--accent);
  color: #000;
}
.btn-primary:hover {
  background: #52e896;
}
.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border2);
}
.btn-ghost:hover {
  background: var(--surface2);
  color: var(--text);
}
.btn-danger {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid transparent;
}
.btn-danger:hover {
  border-color: var(--danger);
}
.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
