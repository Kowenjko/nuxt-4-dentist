<script lang="ts" setup>
const props = defineProps<{
  editing: boolean
  saving?: boolean
  formError?: string
  formData: UserI
  doctorOptions: { value: string; name: string }[]
}>()

const emit = defineEmits<{ confirm: [] }>()
const model = defineModel()
</script>

<template>
  <AdminModal
    :title="editing ? 'Редагувати користувача' : 'Новий користувач'"
    v-model="model"
    :saving
    :name-button-confirm="saving ? 'Збереження...' : 'Зберегти'"
    @confirm="emit('confirm')"
  >
    <div v-if="formError" class="alert alert-error">{{ formError }}</div>
    <div class="form-row">
      <AdminInput v-model="formData.name" label="Ім'я" placeholder="Іван Іваненко" />
      <AdminInput v-model="formData.phone" label="Телефон" placeholder="+380 99 000 00 00" />
    </div>
    <AdminInput
      v-model="formData.email"
      type="email"
      label="Email"
      placeholder="user@example.com"
    />
    <AdminInput
      v-if="!editing"
      v-model="formData.password"
      type="password"
      label="Пароль"
      placeholder="Мінімум 8 символів"
    />

    <AdminInput label="Роль" select v-model="formData.role" :options="doctorOptions" />

    <AdminInput
      v-if="formData.role === Roles.DOCTOR && !editing"
      v-model="formData.specialty"
      label="Спеціальність"
      placeholder="Стоматолог"
    />
  </AdminModal>
</template>
