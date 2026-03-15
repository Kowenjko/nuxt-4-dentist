<script lang="ts" setup>
const props = defineProps<{ detailAppointment: AppointmentI }>()

const emit = defineEmits<{ delete: []; confirm: [] }>()
const model = defineModel()
const notes = defineModel<string>('notes')
</script>

<template>
  <AdminModal
    title="Деталі запису"
    v-model="model"
    name-button-delete="Видалити запис"
    name-button-confirm="Зберегти нотатки"
    @delete="emit('delete')"
    @confirm="emit('confirm')"
  >
    <div class="detail-grid" style="margin-bottom: 16px">
      <div class="detail-box">
        <div class="detail-lbl">Пацієнт</div>
        <div class="detail-val">{{ detailAppointment.client?.name }}</div>
        <div class="detail-sub">{{ detailAppointment.client?.email }}</div>
        <div class="detail-sub">{{ detailAppointment.client?.phone }}</div>
      </div>
      <div class="detail-box">
        <div class="detail-lbl">Лікар</div>
        <div class="detail-val">{{ detailAppointment.doctor?.user?.name }}</div>
        <div class="detail-sub">{{ detailAppointment.doctor?.specialty }}</div>
      </div>
      <div class="detail-box">
        <div class="detail-lbl">Послуга</div>
        <div class="detail-val">{{ detailAppointment.service?.name }}</div>
        <div class="detail-sub mono">
          {{ detailAppointment.service?.duration }} хв ·
          {{ Number(detailAppointment.service?.price).toLocaleString('uk-UA') }} ₴
        </div>
      </div>
      <div class="detail-box">
        <div class="detail-lbl">Час</div>
        <div class="detail-val mono">{{ formatDate(detailAppointment.startTime) }}</div>
        <div class="detail-sub mono">
          {{ formatTime(detailAppointment.startTime) }} —
          {{ formatTime(detailAppointment.endTime) }}
        </div>
      </div>
    </div>
    <AdminInput textarea v-model="notes" label="Нотатки лікаря" placeholder="Додайте нотатки..." />
    <!-- <div class="fg">
      <label class="fl">Нотатки лікаря</label>
      <textarea v-model="detailNotes" class="fi fi-ta" placeholder="Додайте нотатки..."></textarea>
    </div> -->
  </AdminModal>
</template>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.detail-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 14px;
}
.detail-lbl {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.detail-val {
  font-size: 13.5px;
  font-weight: 600;
}
.detail-sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
}
</style>
