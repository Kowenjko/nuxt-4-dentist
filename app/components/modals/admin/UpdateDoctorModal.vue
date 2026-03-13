<script lang="ts" setup>
const props = defineProps<{
  title: string
  saving?: boolean
  formError?: string
  formData: DoctorUpdateI
  services?: ServiceI[]
}>()

const emit = defineEmits<{ confirm: [] }>()
const model = defineModel()
</script>

<template>
  <AdminModal
    :title
    v-model="model"
    :saving
    :name-button-confirm="saving ? 'Збереження...' : 'Зберегти'"
    @confirm="emit('confirm')"
  >
    <div v-if="formError" class="alert alert-error">{{ formError }}</div>
    <AdminInput v-model="formData.specialty" label="Спеціальність" placeholder="Стоматолог" />
    <AdminInput v-model="formData.bio" label="Про лікаря" placeholder="Короткий опис..." textarea />

    <AdminInput v-model="formData.serviceIds" label="Послуги" checkbox :options="services">
      <template v-slot="{ option }">
        <span class="checkbox-price">
          {{ Number(option.price).toLocaleString('uk-UA') }} ₴ · {{ option.duration }} хв
        </span>
      </template>
    </AdminInput>
  </AdminModal>
</template>
<style scoped>
.checkbox-price {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--text-3);
}

@media (max-width: 640px) {
  .checkbox-price {
    display: none;
  }
}
</style>
