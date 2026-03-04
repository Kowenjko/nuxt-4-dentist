<script lang="ts" setup>
const { text = 'Увійти через Google' } = defineProps<{ text?: string }>()
</script>

<template>
  <button class="btn-google" v-bind="$attrs">
    <GoogleIcon />
    {{ text }}
  </button>
</template>
<style scoped>
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all var(--duration-fast);
}
.btn-google:hover:not(:disabled) {
  border-color: var(--border-2);
  background: var(--bg-2);
  box-shadow: var(--shadow-sm);
}
.btn-google:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
