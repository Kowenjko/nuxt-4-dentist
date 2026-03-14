<script lang="ts" setup>
const emit = defineEmits<{ delete: [] }>()
const model = defineModel<ServiceI>()
</script>

<template>
  <AdminModal
    title="Видалити користувача?"
    v-model="model"
    name-button-delete="Видалити"
    size="sm"
    @delete="emit('delete')"
  >
    <p class="info">
      Видалити <strong>{{ model?.name }}</strong
      >?<br />
      <span class="info-danger">Неможливо, якщо є активні записи.</span>
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
