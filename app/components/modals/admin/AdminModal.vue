<script lang="ts" setup>
import { XIcon } from 'lucide-vue-next'

const {
  title,
  saving = false,
  nameButtonConfirm = '',
  nameButtonDelete = '',
  size = 'hd',
} = defineProps<{
  title: string
  saving?: boolean
  nameButtonConfirm?: string
  nameButtonDelete?: string
  size?: 'sm' | 'hd' | 'lg'
}>()
const emit = defineEmits<{ confirm: []; delete: [] }>()

const model = defineModel()
</script>

<template>
  <div v-if="model" class="overlay" @click.self="model = false">
    <div class="modal">
      <div :class="`modal-${size}`">
        <span class="modal-title">{{ title }}</span>
        <button class="modal-x" @click="model = false"><XIcon /></button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-ft">
        <AdminButton @click="model = false" variant="ghost">Скасувати</AdminButton>
        <AdminButton @click="emit('confirm')" v-if="nameButtonConfirm" :disabled="saving">
          {{ nameButtonConfirm }}
        </AdminButton>
        <AdminButton
          @click="emit('delete')"
          v-if="nameButtonDelete"
          :disabled="saving"
          variant="danger"
        >
          {{ nameButtonDelete }}
        </AdminButton>
      </div>
    </div>
  </div>
</template>
<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}
.modal-lg {
  max-width: 640px;
}
.modal-sm {
  max-width: 380px;
}
.modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border);
}
.modal-title {
  font-size: 15px;
  font-weight: 600;
}
.modal-x {
  background: none;
  border: none;
  color: var(--text-3);
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}
.modal-x:hover {
  color: var(--text);
}
.modal-body {
  padding: 22px;
}
.modal-ft {
  padding: 14px 22px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
