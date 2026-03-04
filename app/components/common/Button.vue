<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  size?: 'md' | 'lg'
  variant?: 'outline' | 'link' | 'primary' | 'danger' | 'secondary' | 'line'
  to?: RouteLocationRaw
}

const { type = 'button', variant = 'primary', size } = defineProps<Props>()

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
