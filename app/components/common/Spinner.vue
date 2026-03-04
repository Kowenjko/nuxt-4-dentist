<template>
  <div class="spinner" />
</template>
<style scoped>
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  animation: auth-spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes auth-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
