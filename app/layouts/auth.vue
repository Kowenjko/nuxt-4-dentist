<script lang="ts" setup></script>

<template>
  <main class="auth-layout">
    <slot />
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
