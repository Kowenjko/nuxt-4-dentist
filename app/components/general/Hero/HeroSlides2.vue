<script setup lang="ts">
const mounted = ref(false)

const doctors = ['Ковенько Андрій', 'Ковенько Юрій', 'Ковенько Олександр', 'Ковенько Тетяна']

const index = ref(0)
const progress = ref(0)
const paused = ref(false)

let timer: any

const duration = 3500

const start = () => {
  const step = 20

  timer = setInterval(() => {
    if (paused.value) return

    progress.value += step

    if (progress.value >= duration) {
      progress.value = 0
      index.value = (index.value + 1) % doctors.length
    }
  }, step)
}

onMounted(() => {
  mounted.value = true
  start()
})

const getDoctor = (offset: number) => doctors[(index.value + offset) % doctors.length]

const hover = (state: boolean) => {
  paused.value = state
}
</script>

<template>
  <div class="cards" @mouseenter="hover(true)" @mouseleave="hover(false)">
    <HeroDoctorCard class="card card-back2" :name="getDoctor(2)" />

    <HeroDoctorCard class="card card-back1" :name="getDoctor(1)" />

    <Transition name="card-main" mode="out-in">
      <HeroDoctorCard class="card card-main" :key="getDoctor(0)" :name="getDoctor(0)" />
    </Transition>
  </div>
</template>
<style scoped>
.cards {
  position: relative;
  height: auto;
  min-height: 230px;
}

.card {
  transition: all 0.45s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.card-main {
  position: relative;
  z-index: 3;
}

.card-back1 {
  position: absolute;
  top: 14px;
  left: 20px;
  right: 20px;
  transform: scale(0.96);
  opacity: 0.65;
  z-index: 2;
}

.card-back2 {
  position: absolute;
  top: 28px;
  left: 40px;
  right: 40px;
  transform: scale(0.92);
  opacity: 0.35;
  z-index: 1;
}

.card-main-enter-active,
.card-main-leave-active {
  transition: all 0.45s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.card-main-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

.card-main-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.95);
}
.slider-progress {
  height: 4px;
  width: 100%;
  background: var(--f2);
  border-radius: 20px;
  margin-top: 14px;
  overflow: hidden;
}

.slider-progress-bar {
  height: 100%;
  background: var(--g);
  width: 0%;
  transition: width 0.05s linear;
}
</style>
