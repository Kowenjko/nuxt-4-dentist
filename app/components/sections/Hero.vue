<script lang="ts" setup>
import { MoveRightIcon, PlayIcon } from 'lucide-vue-next'

const { open } = useBooking()
const mounted = ref(false)

const { data: doctors, refresh } = useAPI<DoctorProfileI[]>(DOCTORS)

const refreshDoctors = async () => {
  await refresh()
}

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <section class="hero">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>

    <div class="hero-wrap">
      <div class="hero-left">
        <div class="hero-pill" :class="{ show: mounted }">
          <span class="pill-dot"></span>
          Онлайн-запис доступний зараз
        </div>

        <h1 class="hero-h1" :class="{ show: mounted }">
          Турбота<br />про здоров'я —<br /><span class="h1-accent">без черг</span>
        </h1>

        <p class="hero-p" :class="{ show: mounted }">
          Сучасна клініка з командою досвідчених спеціалістів. Запишіться онлайн у будь-який час —
          ми підберемо зручний слот за лічені секунди.
        </p>

        <div class="hero-actions" :class="{ show: mounted }">
          <Button size="lg" is-animated-svg @click="open">
            Обрати лікаря
            <MoveRightIcon />
          </Button>
          <a @click.prevent="scrollToId('steps')" class="btn-text">
            <span class="btn-text-circle"><PlayIcon /></span>
            Як це працює
          </a>
        </div>

        <div class="hero-nums" :class="{ show: mounted }">
          <div class="num-item"><b>15+</b><span>років досвіду</span></div>
          <div class="num-sep"></div>
          <div class="num-item"><b>12</b><span>спеціалістів</span></div>
          <div class="num-sep"></div>
          <div class="num-item"><b>8 000+</b><span>пацієнтів</span></div>
        </div>
      </div>

      <div class="hero-right" :class="{ show: mounted }">
        <!-- Booking card -->
        <HeroSlides v-if="doctors" :doctors @select-slot="refreshDoctors" />

        <!-- Floating chips -->
        <Chip title="Запис підтверджено" sub="Завтра 09:00 · Стоматолог" />
        <Chip title="4.9 з 5" sub="342 відгуки" type="rating" />

        <!-- Deco ring -->
        <div class="deco-ring"></div>
      </div>
    </div>

    <!-- Scroll hint -->
    <ScrollHint :class="{ show: mounted }" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
  background: var(--f0);
}

/* noise через ::after на .hero — без окремого div */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.03) 1px, transparent 0),
    radial-gradient(circle at 3px 3px, rgba(0, 0, 0, 0.03) 1px, transparent 0);
  background-size:
    4px 4px,
    6px 6px;
  mix-blend-mode: multiply;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}
.hero-orb-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, #73d299 0%, transparent 70%);
  top: -200px;
  right: -150px;
  opacity: 0.5;
  animation: orb 12s ease-in-out infinite;
}
.hero-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #75cc94 0%, transparent 70%);
  bottom: -100px;
  left: -80px;
  opacity: 0.45;
  animation: orb 9s ease-in-out infinite reverse;
}
@keyframes orb {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(30px, -40px);
  }
  66% {
    transform: translate(-20px, 30px);
  }
}

.hero-wrap {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 72px;
}

/* Hero left anims */
.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  border: 1px solid var(--gl);
  background: var(--gx);
  font-size: 13px;
  font-weight: 500;
  color: var(--g1);
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.5s var(--ease),
    transform 0.5s var(--ease);
}
.hero-pill.show {
  opacity: 1;
  transform: translateY(0);
}
.pill-dot {
  width: 7px;
  height: 7px;
  background: var(--g2);
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.hero-h1 {
  font-family: var(--serif);
  font-size: clamp(40px, 5.5vw, 66px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 22px;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s var(--ease) 0.1s,
    transform 0.6s var(--ease) 0.1s;
}
.hero-h1.show {
  opacity: 1;
  transform: translateY(0);
}
.h1-accent {
  color: var(--g1);
  font-style: italic;
}

.hero-p {
  font-size: 17px;
  font-weight: 400;
  color: var(--i3);
  line-height: 1.75;
  max-width: 480px;
  margin-bottom: 36px;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s var(--ease) 0.2s,
    transform 0.6s var(--ease) 0.2s;
}
.hero-p.show {
  opacity: 1;
  transform: translateY(0);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s var(--ease) 0.3s,
    transform 0.6s var(--ease) 0.3s;
}
.hero-actions.show {
  opacity: 1;
  transform: translateY(0);
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--i3);
  cursor: pointer;
  transition: color 0.15s;
}
.btn-text:hover {
  color: var(--ink);
}
.btn-text-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--f2);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--g1);
  transition:
    border-color 0.3s,
    background 0.3s;

  svg {
    width: 16px;
    height: 16px;
  }
}
.btn-text:hover .btn-text-circle {
  border-color: var(--g1);
  background: var(--gx);
}

.hero-nums {
  display: flex;
  align-items: center;
  gap: 28px;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.6s var(--ease) 0.4s,
    transform 0.6s var(--ease) 0.4s;
}
.hero-nums.show {
  opacity: 1;
  transform: translateY(0);
}
.num-item {
  display: flex;
  flex-direction: column;
}
.num-item b {
  font-family: var(--font-sans);
  font-size: 28px;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-weight: 500;
}
.num-item span {
  font-size: 12.5px;
  color: var(--i4);
  margin-top: 2px;
}
.num-sep {
  width: 1px;
  height: 40px;
  background: var(--f2);
}

/* Hero right */
.hero-right {
  position: relative;
  height: 550px;
  opacity: 0;
  transform: translateX(32px) scale(0.97);
  transition:
    opacity 0.7s var(--ease) 0.3s,
    transform 0.7s var(--ease) 0.3s;
}
.hero-right.show {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.deco-ring {
  position: absolute;
  z-index: -1;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  border: 1px dashed var(--f3);
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
  animation: spin-slow 30s linear infinite;
}
@keyframes spin-slow {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
