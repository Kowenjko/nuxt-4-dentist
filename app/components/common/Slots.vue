<script lang="ts" setup>
const props = defineProps<{ slots: TimeSlot[]; selSlot: TimeSlot }>()

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
  margin-bottom: 14px;
}
.book-slot {
  padding: 8px 4px;
  border-radius: 8px;
  border: 1.5px solid var(--f2);
  background: none;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--i3);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.book-slot:hover {
  border-color: var(--g1);
  color: var(--g1);
  background: var(--gx);
}
.book-slot.sel {
  background: var(--g);
  border-color: var(--g);
  color: white;
}
</style>
