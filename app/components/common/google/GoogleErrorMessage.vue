<script lang="ts" setup>
const { errorMsg } = defineProps<{ errorMsg: string }>()
</script>

<template>
  <!-- Ошибка от Google -->
  <div v-if="errorMsg" class="error-box">
    <div class="error-icon">✕</div>
    <p class="error-text">{{ errorMsg }}</p>
    <NuxtLink :to="LOGIN_LINK" class="back-link">← Повернутися до входу</NuxtLink>
  </div>
</template>
<style scoped>
.error-box {
  background: var(--bg-card);
  border: 1px solid var(--border-error);
  border-radius: 12px;
  padding: 36px 40px;
  max-width: 380px;
  text-align: center;
  box-shadow: var(--shadow-card-soft);
}

.error-icon {
  width: 44px;
  height: 44px;
  background: var(--bg-error);
  color: var(--text-error);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin: 0 auto 16px;
}

.error-text {
  font-size: 14px;
  color: var(--text-body);
  margin-bottom: 20px;
  line-height: 1.5;
}

.back-link {
  font-size: 13px;
  color: var(--text-brand);
  font-weight: 500;
  text-decoration: none;
}
.back-link:hover {
  text-decoration: underline;
}
</style>
