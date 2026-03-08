<script lang="ts" setup>
const { doctor } = defineProps<{ doctor: DoctorProfileI }>()

const { data: slots } = useAPI(DOCTORS + `/${doctor?.id}` + SLOTS, {
  params: { date: '2026-03-10', serviceId: doctor.services?.[0]?.id },
})

console.log(slots.value)

const selSlot = ref('')
</script>

<template>
  <div class="book-card">
    <div class="book-card-top">
      <div class="book-doc-av">ОС</div>
      <div class="book-doc-info">
        <div class="book-doc-name">{{ doctor.user.name }}</div>
        <div class="book-doc-spec">{{ doctor.specialty }}</div>
        <div class="book-doc-spec">{{ doctor.services?.[0]?.name }}</div>
      </div>

      <div class="book-status">Вільна</div>
    </div>
    <div class="book-label">Оберіть час</div>
    <div class="book-slots">
      <button
        v-for="slot in slots.slots"
        :key="slot.time"
        class="book-slot"
        :class="{ sel: selSlot === slot }"
        @click="selSlot = slot"
      >
        {{ slot.time }}
      </button>
    </div>
    <NuxtLink to="/register" class="book-cta" :class="{ active: selSlot }">
      {{ selSlot ? `Записатись на ${selSlot}` : 'Оберіть час' }}
    </NuxtLink>
  </div>
</template>
<style scoped>
.book-card {
  /* position: absolute; */
  /* top: 24px; */
  /* left: 0px; */
  /* right: 30px; */
  background: white;
  border: 1px solid var(--f2);
  border-radius: 18px;
  padding: 22px 22px 18px;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.09);
}
.book-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.book-doc-av {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--gx);
  color: var(--g);
  font-family: var(--serif);
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.book-doc-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ink);
}
.book-doc-spec {
  font-size: 12px;
  color: var(--i4);
  margin-top: 2px;
}
.book-status {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--gx);
  color: var(--g1);
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
}
.book-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--i4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}
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
.book-cta {
  display: block;
  text-align: center;
  padding: 11px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  background: var(--f1);
  color: var(--i3);
  transition: all 0.2s;
}
.book-cta.active {
  background: var(--g);
  color: white;
}
.book-cta.active:hover {
  background: var(--g1);
}
</style>
