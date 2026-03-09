<script lang="ts" setup>
const { isDark, toggle: toggleTheme } = useTheme('client')

interface Props {
  title: string
  description: string
  loading?: boolean
  formError?: string
  textGoogle?: string
}

const { title, description, loading, formError, textGoogle } = defineProps<Props>()

const emit = defineEmits<{
  clickGoogle: []
}>()
</script>

<template>
  <div class="auth-card">
    <div class="auth-brand">
      <span class="brand-cross">✚</span>
      <span>{{ COMPANY_NAME }}</span>
      <ThemeButton :isDark="isDark" @click="toggleTheme" class="auth-theme-btn" />
    </div>

    <h1 class="auth-title">{{ title }}</h1>
    <p class="auth-sub">{{ description }}</p>

    <!-- Google button -->
    <GoogleButton @click="emit('clickGoogle')" :disabled="loading" :text="textGoogle" />

    <Divider>або</Divider>
    <div v-if="formError" class="auth-alert">{{ formError }}</div>

    <slot />
    <p class="auth-footer">
      <slot name="footer" />
    </p>
  </div>
</template>
<style scoped>
.auth-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-modal);
  transition:
    background var(--duration-base),
    border-color var(--duration-base);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 32px;
}
.brand-cross {
  font-size: 20px;
  color: var(--accent);
  flex-shrink: 0;
}

.auth-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}
.auth-sub {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 4px;
  margin-bottom: 24px;
}

.auth-theme-btn {
  margin-left: auto;
}

.auth-alert {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger-border);
  margin-bottom: 16px;
  line-height: 1.5;
}

.auth-footer {
  text-align: center;
  font-size: 13px;
  color: var(--text-3);
  margin-top: 20px;
}
.auth-footer :deep(a) {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}
.auth-footer :deep(a):hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 20px;
    border-radius: 12px;
  }
}
</style>
