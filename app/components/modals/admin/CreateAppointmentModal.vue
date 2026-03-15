<script lang="ts" setup>
const props = defineProps<{
  saving?: boolean
  formError?: string
  formData: CreateAppointmentI
  doctorsServices: DoctorProfileI['services']
  doctors: DoctorProfileI[]
  users?: UserI[]
}>()

const emit = defineEmits<{ confirm: [] }>()
const model = defineModel()

const optionsDoctor = computed(
  () => props.doctors?.map((doctor) => ({ value: doctor.id, name: doctor.user.name })) || []
)
const optionsService = computed(
  () => props.doctorsServices?.map((service) => ({ value: service.id, name: service.name })) || []
)
const optionsUsers = computed(
  () =>
    props.users
      // ?.filter((user) => user.role === Roles.CLIENT)
      ?.map((user) => ({ value: user.id, name: user.name })) || []
)
</script>

<template>
  <AdminModal
    title="Новий запис"
    v-model="model"
    size="lg"
    :saving
    :name-button-confirm="saving ? 'Створення...' : 'Створити запис'"
    @confirm="emit('confirm')"
  >
    <div v-if="formError" class="alert alert-error">{{ formError }}</div>
    <div class="form-row">
      <AdminInput
        v-model="formData.doctorId"
        label="Лікар"
        select
        :options="[{ value: '', name: 'Оберіть лікаря' }, ...optionsDoctor]"
      />
      <AdminInput
        v-model="formData.serviceId"
        label="Послуга"
        select
        :options="[{ value: '', name: 'Оберіть послугу' }, ...optionsService]"
      />
    </div>
    <div class="form-row">
      <AdminInput
        v-model="formData.clientId"
        label="Клієнт"
        select
        :options="[{ value: '', name: 'Оберіть клієнта' }, ...optionsUsers]"
      />
      <AdminInput v-model="formData.startTime" label="Дата та час" type="datetime-local" />
    </div>
    <AdminInput textarea v-model="formData.notes" label="Нотатки" placeholder="Необов'язково..." />
  </AdminModal>
</template>
