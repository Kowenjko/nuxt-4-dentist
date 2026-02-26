<script lang="ts" setup>
interface Props {
  type: 'button' | 'submit' | 'reset'
}

const { type = 'button' } = defineProps<Props>()
</script>

<template>
  <button :type class="btn-base" v-bind="$attrs">
    <slot />
  </button>
</template>
<style scoped>
.btn-base {
  width: 100%;
  padding: 10px;
  background: #1a3a2a;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.btn-base:hover:not(:disabled) {
  background: #152e21;
}
.btn-base:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
