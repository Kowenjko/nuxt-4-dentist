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
  border: 1.5px solid #e4e2dc;
  border-radius: 8px;
  background: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #1a1917;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-google:hover:not(:disabled) {
  border-color: #bbb;
  background: #fafaf8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
