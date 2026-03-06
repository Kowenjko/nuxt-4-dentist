<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'link' | 'primary' | 'danger' | 'secondary' | 'ghost'
  to?: RouteLocationRaw
  isAnimatedSvg?: boolean
}

const {
  type = 'button',
  variant = 'primary',
  size = 'md',
  isAnimatedSvg = false,
} = defineProps<Props>()

const btn = computed(() => {
  let classes = 'btn'
  if (variant) classes += ` btn-${variant}`
  if (size) classes += ` btn-${size}`
  if (isAnimatedSvg) classes += ` svg-animate`

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
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  border: none;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
  white-space: nowrap;
  user-select: none;
}
.btn :deep(svg) {
  width: 18px !important;
  height: 18px !important;
  transition: transform 0.2s;
}

.svg-animate:hover :deep(svg) {
  transform: translateX(4px);
}
.btn span {
  font-size: 16px;
}
.btn-ghost {
  background: none;
}

.btn-ghost:hover {
  color: var(--g1) !important;
}

.btn-primary {
  background: var(--accent);
  color: var(--green-50) !important;
  box-shadow: var(--shadow-accent);
}
.btn-primary:hover {
  background: var(--accent-2);
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.18);
}
.btn-secondary {
  background: var(--accent-bg);
  color: var(--accent);
  border: 1.5px solid var(--accent-light);
}
.btn-secondary:hover {
  background: var(--accent-light);
}
.btn-outline {
  background: transparent;
  color: var(--text-3);
  border: 1.5px solid var(--border);
}
.btn-outline:hover {
  border-color: var(--border-2);
  color: var(--text);
}
.btn-danger {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1.5px solid var(--danger-border);
}
.btn-danger:hover {
  background: var(--danger);
  color: var(--text-inv);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}
.btn-md {
  padding: 10px 20px;
  font-size: 14px;
}
.btn-lg {
  padding: 13px 28px;
  font-size: 15.5px;
}
</style>
