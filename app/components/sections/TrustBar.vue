<script lang="ts" setup>
const trusts = [
  { icon: '🏥', label: 'Ліцензована клініка' },
  { icon: '👨‍⚕️', label: 'Сертифіковані лікарі' },
  { icon: '🔒', label: 'Конфіденційність даних' },
  { icon: '⏱', label: 'Запис за 2 хвилини' },
  { icon: '💬', label: 'Онлайн-нагадування' },
  { icon: '🌐', label: 'Доступно 24/7' },
]
</script>

<template>
  <div class="trust-bar">
    <div class="trust-wrap">
      <div v-for="t in trusts" :key="t.label" class="trust-item">
        <span class="trust-icon">{{ t.icon }}</span>
        <span class="trust-label">{{ t.label }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* ── Trust bar ──────────────────────────────── */
.trust-bar {
  background: var(--g);
  padding: 16px 0;
  overflow: hidden;
}
.trust-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  gap: 0;
  flex-wrap: wrap;
  justify-content: space-between;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}
.trust-icon {
  font-size: 18px;
}
.trust-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}
</style>
