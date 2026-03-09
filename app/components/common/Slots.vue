<script lang="ts" setup>
const props = defineProps<{ slots: TimeSlot[]; selSlot: TimeSlot | null }>()

const emit = defineEmits<{ selectSlot: [slot: TimeSlot] }>()
</script>

<template>
  <div class="book-slots" v-if="slots && slots.length">
    <button
      v-for="slot in slots"
      :key="slot.time"
      class="slot-btn"
      :class="{
        'slot-sel': selSlot?.time === slot.time,
        'slot-busy': !slot.available,
      }"
      @click="emit('selectSlot', slot)"
      :disabled="!slot.available"
    >
      {{ slot.time }}
      <span v-if="!slot.available" class="slot-busy-x">зайнято</span>
    </button>
  </div>
</template>
<style scoped>
.book-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}
.slot-btn {
  padding: 10px 6px;
  border-radius: 10px;
  border: 1.5px solid var(--accent-light);
  background: var(--accent-bg);
  font-family: var(--bm-mono);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.slot-btn:hover:not(:disabled) {
  border-color: var(--bm-g);
  color: var(--bm-g);
  background: var(--bm-gx);
}
.slot-sel {
  background: var(--bm-g) !important;
  border-color: var(--bm-g) !important;
  color: white !important;
  box-shadow: 0 3px 12px rgba(22, 80, 47, 0.28);
}
.slot-busy {
  opacity: 0.7;
  cursor: not-allowed;
  border: 1.5px solid var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger);
}
.slot-busy-x {
  font-family: var(--bm-sans);
  font-size: 9px;
  color: var(--danger);
  font-weight: 400;
}
@media (max-width: 400px) {
  .slots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
