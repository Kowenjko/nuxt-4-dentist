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
  border: 1.5px solid var(--border-google-btn);
  border-radius: 8px;
  background: var(--bg-google-btn);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-google:hover:not(:disabled) {
  border-color: var(--border-google-btn-hover);
  background: var(--bg-google-btn-hover);
  box-shadow: var(--shadow-google-btn);
}
.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
