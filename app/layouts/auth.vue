<script lang="ts" setup></script>

<template>
  <Header />
  <main class="auth-page">
    <slot />
  </main>
  <Footer />
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  padding: 20px;
  transition: background var(--duration-base);
}
</style>
