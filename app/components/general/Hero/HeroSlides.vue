<script lang="ts" setup>
const { doctors } = defineProps<{ doctors: DoctorProfileI[] }>()

const offset = ref(0)
const paused = ref(false)
let rafId = 0 // звичайна змінна, не ref — rAF id не потребує реактивності

const speed = 0.4
const cardHeight = 300 // висота картки (120) + gap (18)

const loopDoctors = computed(() => {
  if (!doctors.length) return []
  return [...doctors, ...doctors]
})

const totalHeight = computed(() => doctors.length * cardHeight)

// tick визначена як стрілка всередині onMounted — не доступна під час SSR
onMounted(() => {
  const tick = () => {
    if (!paused.value && totalHeight.value > 0) {
      offset.value += speed
      if (offset.value >= totalHeight.value) {
        offset.value -= totalHeight.value
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  const start = () => {
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  // Стартуємо одразу якщо дані є, або чекаємо поки прийдуть
  if (doctors.length) {
    start()
  } else {
    const stop = watch(
      () => doctors.length,
      (len) => {
        if (len > 0) {
          start()
          stop()
        }
      }
    )
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
})
</script>

<template>
  <div class="hero-carousel" @mouseenter="paused = true" @mouseleave="paused = false">
    <!-- Skeleton поки немає даних -->

    <template v-if="!doctors.length">
      <div class="carousel-skeleton">
        <div v-for="n in 3" :key="n" class="skeleton-card" />
      </div>
    </template>

    <template v-else>
      <div class="carousel" :style="{ transform: `translateY(-${offset}px)` }">
        <HeroDoctorCard v-for="(doctor, i) in loopDoctors" :key="i" :doctor class="carousel-card" />
      </div>
    </template>

    <div class="mask-top" />
    <div class="mask-bottom" />
  </div>
</template>

<style scoped>
.hero-carousel {
  height: 420px;
  overflow: hidden;
  position: relative;
  border-radius: 30px;
}

/* Carousel track — БЕЗ transition, rAF сам керує плавністю */
.carousel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  will-change: transform;
}

.carousel-card {
  position: relative !important;
  transform: scale(0.92);
  opacity: 0.75;
  transition: all 0.3s ease;
}

/* Центральна картка (~4-та в списку) */
.carousel-card:nth-child(4) {
  transform: scale(1);
  opacity: 1;
}

.carousel-card:hover {
  transform: scale(1) translateY(-2px) !important;
  opacity: 1 !important;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
}

.carousel-card:hover::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  border: 2px solid var(--g);
  opacity: 0.4;
  pointer-events: none;
}

/* Blur masks */
.mask-top,
.mask-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
  z-index: 2;
}

.mask-top {
  top: 0;
  background: linear-gradient(to bottom, var(--f0, #f5f4f0) 20%, transparent);
}

.mask-bottom {
  bottom: 0;
  top: auto;
  background: linear-gradient(to top, var(--f0, #f5f4f0) 20%, transparent);
}

/* Skeleton */
.carousel-skeleton {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
}

.skeleton-card {
  height: 120px;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    var(--border, #e4e2dc) 25%,
    var(--bg-2, #eeede9) 50%,
    var(--border, #e4e2dc) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
