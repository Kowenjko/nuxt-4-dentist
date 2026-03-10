<script lang="ts" setup>
const { data: doctors, pending } = useAPI<DoctorProfileI[]>(DOCTORS)
</script>

<template>
  <section id="doctors" class="sect doctors-sect">
    <div class="container">
      <div class="sect-hd">
        <div class="eyebrow">Команда</div>
        <h2 class="sect-h2">Наші лікарі</h2>
        <p class="sect-p">
          Сертифіковані спеціалісти з багаторічним досвідом та індивідуальним підходом до кожного
          пацієнта
        </p>
      </div>

      <div v-if="pending" class="doc-grid">
        <div v-for="i in 4" :key="i" class="skel skel-tall"></div>
      </div>

      <div v-else class="doc-grid">
        <DoctorCard v-for="(doctor, i) in doctors" :key="doctor.id" :doctor :featured="i === 0" />
      </div>
    </div>
  </section>
</template>
<style scoped>
.doctors-sect {
  background: var(--f0);
}
.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 22px;
}
</style>
