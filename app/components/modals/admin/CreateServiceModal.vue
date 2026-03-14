<script lang="ts" setup>
const props = defineProps<{
  editing: boolean
  saving?: boolean
  formError?: string
  formData: ServiceI
}>()

const emit = defineEmits<{ confirm: [] }>()
const modal = defineModel()
</script>

<template>
  <AdminModal
    :title="editing ? 'Редагувати послугу' : 'Нова послуга'"
    v-model="modal"
    size="sm"
    :saving
    :name-button-confirm="saving ? 'Збереження...' : 'Зберегти'"
    @confirm="emit('confirm')"
  >
    <div v-if="formError" class="alert alert-error">{{ formError }}</div>

    <AdminInput v-model="formData.name" label="Назва" placeholder="Лікування карієсу" />

    <div class="form-row">
      <AdminInput
        v-model="formData.duration"
        label="Тривалість (хв)"
        placeholder="60"
        type="number"
        min="15"
        step="15"
      />
      <AdminInput
        v-model="formData.price"
        label="Ціна (₴)"
        placeholder="1200"
        type="number"
        min="0"
        step="100"
      />
    </div>
  </AdminModal>
</template>
