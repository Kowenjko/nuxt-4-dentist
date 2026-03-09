<script lang="ts" setup></script>

<template>
  <div class="auth-divider">
    <span><slot /></span>
  </div>
</template>
<style scoped>
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
.auth-divider span {
  font-size: 12px;
  color: var(--text-4);
}
</style>
