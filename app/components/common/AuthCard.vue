<script lang="ts" setup>
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
    </div>

    <h1 class="auth-title">{{ title }}</h1>
    <p class="auth-sub">{{ description }}</p>

    <!-- Google button -->
    <GoogleButton @click="emit('clickGoogle')" :disabled="loading" :text="textGoogle" />

    <div class="divider"><span>або</span></div>
    <div v-if="formError" class="alert alert-error">{{ formError }}</div>

    <slot />
  </div>
</template>
<style scoped>
.auth-card {
  background: white;
  border: 1px solid #e4e2dc;
  border-radius: 14px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a3a2a;
  margin-bottom: 32px;
}
.brand-cross {
  font-size: 20px;
  color: #2e7d52;
}

.auth-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1917;
}
.auth-sub {
  font-size: 13px;
  color: #7a7872;
  margin-top: 4px;
  margin-bottom: 24px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e4e2dc;
}
.divider span {
  font-size: 12px;
  color: #aaa;
}

.alert {
  padding: 10px 14px;
  border-radius: 7px;
  font-size: 13px;
  margin-bottom: 16px;
}
.alert-error {
  background: #fdf0ee;
  color: #c0392b;
}
</style>
