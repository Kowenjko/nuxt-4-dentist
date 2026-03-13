<script lang="ts" setup>
const emit = defineEmits<{ delete: [] }>()
const model = defineModel<UserI>()
</script>

<template>
  <AdminModal
    title="Видалити користувача?"
    v-model="model"
    name-button-delete="Видалити"
    @delete="emit('delete')"
  >
    <p class="info">
      Видалити
      <strong style="color: var(--text)">{{ model?.name }}</strong>
      ?<br />
      Цю дію не можна скасувати.
    </p>
  </AdminModal>
</template>

<style scoped>
.info {
  font-size: 13.5px;
  color: var(--text-2);
  line-height: 1.6;
}
</style>
