<script lang="ts" setup>
const emit = defineEmits<{ delete: [] }>()
const model = defineModel<AppointmentI>()
</script>

<template>
  <AdminModal
    title="Видалити запис?"
    v-model="model"
    name-button-delete="Видалити"
    size="sm"
    @delete="emit('delete')"
  >
    <p class="info">
      Видалити запис клієнта<br />
      <strong>{{ model?.client.name }}</strong> -
      <strong>{{ fmtDateTime(model?.startTime!) }}</strong> ?<br />
      <span class="info-danger"> Цю дію не можна скасувати.</span>
    </p>
  </AdminModal>
</template>

<style scoped>
.info {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.6;
  string {
    color: var(--text);
  }
  .info-danger {
    color: var(--danger);
  }
}
</style>
