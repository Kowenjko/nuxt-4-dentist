<script lang="ts" setup>
const { doctor } = defineProps<{ doctor: DoctorProfileI }>()
const emit = defineEmits<{ selectSlot: [] }>()

const nowDate = new Date().toISOString()?.slice(0, 10)

const { data } = useAPI<DoctorSlotsI>(DOCTORS + `/${doctor?.id}` + SLOTS, {
  query: { date: nowDate, serviceId: doctor.services?.[0]?.id },
})
const selSlot = ref<any>(null)
const bookCard = shallowRef(false)

const bookCardRef = useTemplateRef('bookCardRef')
const { open } = useBooking()

onClickOutside(bookCardRef, () => (selSlot.value = null))

const filterSlots = (period: TimeSlotPeriod) => {
  if (!data.value?.slots) return []
  return data.value?.slots.filter((s) => s.period === period)
}

const morningSlots = computed(() => filterSlots(TimeSlotPeriods.MORNING))
const afternoonSlots = computed(() => filterSlots(TimeSlotPeriods.AFTERNOON))
const eveningSlots = computed(() => filterSlots(TimeSlotPeriods.EVENING))

const isAvailable = computed(() => data.value?.slots.every((s) => !s.available))
const lunchBreak = computed(() => data.value?.meta?.lunchBreak ?? null)

const openModal = () => {
  open({ doctor: doctor, service: doctor.services?.[0], date: nowDate, slot: selSlot.value })
  emit('selectSlot')
  selSlot.value = null
}
</script>

<template>
  <div class="book-card" ref="bookCardRef">
    <div class="book-card-top">
      <div class="book-doc-av">{{ iniAvatar(doctor.user.name) }}</div>
      <div class="book-doc-info">
        <div class="book-doc-name">{{ doctor.user.name }}</div>
        <div class="book-doc-spec">{{ doctor.specialty }}</div>
        <div class="book-doc-service">{{ doctor.services?.[0]?.name }}</div>
      </div>

      <div class="book-status free" v-if="data?.slots && data.slots.length > 0 && !isAvailable">
        Вільний
      </div>
      <div class="book-status busy" v-else>Зайнятий</div>
    </div>
    <div class="book-label">Оберіть час - <span> сьогодні</span></div>

    <Slots v-if="morningSlots" :slots="morningSlots!" :selSlot @select-slot="selSlot = $event" />
    <Divider v-if="lunchBreak">Обід {{ lunchBreak.start }} - {{ lunchBreak.end }}</Divider>
    <Slots
      v-if="afternoonSlots"
      :slots="afternoonSlots!"
      :selSlot
      @select-slot="selSlot = $event"
    />
    <Slots v-if="eveningSlots" :slots="eveningSlots!" :selSlot @select-slot="selSlot = $event" />

    <a @click="openModal" class="book-cta" :class="{ active: selSlot?.time || '' }">
      {{ selSlot?.time ? `Записатись на ${selSlot.time}` : 'Оберіть час' }}
    </a>
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
  color: var(--black-50);
}
.book-doc-spec {
  font-size: 12px;
  color: var(--i4);
  margin-top: 2px;
}
.book-doc-service {
  font-size: 13px;
  color: var(--accent);
  font-weight: 700;
  margin-top: 2px;
}
.book-status {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
  &.free {
    background: var(--gx);
    color: var(--g1);
  }
  &.busy {
    background: var(--bm-redbg);
    color: var(--danger-alias);
  }
}
.book-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--i4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  span {
    text-transform: capitalize;
    color: var(--black-50);
  }
}

.book-cta {
  display: block;
  text-align: center;
  cursor: pointer;
  padding: 11px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  background: var(--f1);
  color: var(--i3);
  transition: all 0.2s;
  margin-top: 14px;
}
.book-cta.active {
  background: var(--g);
  color: white;
}
.book-cta.active:hover {
  background: var(--g1);
}
</style>
