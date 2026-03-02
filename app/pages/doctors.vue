<script lang="ts" setup>
const { open, openApptPanel } = useBooking()

const doctors = ref<any[]>([])

const load = async () => {
  const [dr, sr] = await Promise.all([
    $fetch('/api/doctors') as any,
    $fetch('/api/services') as any,
  ])
  doctors.value = dr
}

onMounted(load)
</script>

<template>
  <div>Doctors</div>
  <button @click="open()">Записатись</button>
  <button @click="openApptPanel()">Мої записи</button>
  <DoctorCard v-for="(doc, i) in doctors" :key="doc.id" :doctor="doc" :featured="i === 0" />
</template>
