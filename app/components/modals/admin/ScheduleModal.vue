<script lang="ts" setup>
const props = defineProps<{
  title: string
  saving?: boolean
  schedule: CreateScheduleI['schedule']
  days: string[]
}>()

const emit = defineEmits<{ confirm: [] }>()
const model = defineModel()
</script>

<template>
  <AdminModal
    :title
    v-model="model"
    size="lg"
    :saving
    :name-button-confirm="saving ? 'Збереження...' : 'Зберегти'"
    @confirm="emit('confirm')"
  >
    <div
      v-for="day in schedule"
      :key="day.weekday"
      class="sched-row"
      :class="{ off: !day.isWorking }"
    >
      <label class="sched-toggle">
        <input type="checkbox" v-model="day.isWorking" />
        <span class="sched-day">{{ days[day.weekday] }}</span>
      </label>
      <div class="sched-times">
        <input type="time" v-model="day.startTime" class="time-inp" :disabled="!day.isWorking" />
        <span class="sched-sep">—</span>
        <input type="time" v-model="day.endTime" class="time-inp" :disabled="!day.isWorking" />
        <span class="sched-lunch-label" v-if="day.isWorking">Обід:</span>
        <input
          v-if="day.isWorking"
          type="time"
          v-model="day.lunchStart"
          class="time-inp time-inp-lunch"
        />
        <span class="sched-sep" v-if="day.isWorking">—</span>
        <input
          v-if="day.isWorking"
          type="time"
          v-model="day.lunchEnd"
          class="time-inp time-inp-lunch"
        />
      </div>
    </div>
  </AdminModal>
</template>
<style scoped>
.sched-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-bottom: 6px;
  transition: opacity 0.15s;
}
.sched-row.off {
  opacity: 0.4;
}

.sched-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.sched-toggle input {
  accent-color: var(--accent);
}
.sched-day {
  font-size: 13px;
  font-weight: 500;
  min-width: 28px;
}
.sched-times {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time-inp {
  padding: 4px 8px;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 5px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12.5px;
  outline: none;
  width: 88px;
}
.time-inp:focus {
  border-color: var(--accent);
}
.time-inp:disabled {
  opacity: 0.3;
}

.sched-lunch-label {
  font-size: 11px;
  color: var(--text-3);
  white-space: nowrap;
  padding-left: 6px;
}
.time-inp-lunch {
  width: 88px;
  opacity: 0.85;
}
.sched-sep {
  color: var(--text-3);
  padding: 0 2px;
}
</style>
