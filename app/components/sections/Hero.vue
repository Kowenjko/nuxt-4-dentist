<script lang="ts" setup>
const mounted = ref(false)
const selSlot = ref('')

onMounted(() => (mounted.value = true))
</script>

<template>
  <section class="hero">
    <div class="hero-noise"></div>
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
          <NuxtLink to="/register" class="btn-hero">
            Обрати лікаря
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16">
              <path d="M4 10h12m-5-5 5 5-5 5" />
            </svg>
          </NuxtLink>
          <a @click.prevent="scrollToId('steps')" class="btn-text">
            <span class="btn-text-circle">▶</span>
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
        <div class="book-card">
          <div class="book-card-top">
            <div class="book-doc-av">ОС</div>
            <div class="book-doc-info">
              <div class="book-doc-name">Олена Савченко</div>
              <div class="book-doc-spec">Терапевт · Кардіолог</div>
            </div>
            <div class="book-status">Вільна</div>
          </div>
          <div class="book-label">Оберіть час</div>
          <div class="book-slots">
            <button
              v-for="t in ['09:00', '10:30', '14:00', '16:30']"
              :key="t"
              class="book-slot"
              :class="{ sel: selSlot === t }"
              @click="selSlot = t"
            >
              {{ t }}
            </button>
          </div>
          <NuxtLink to="/register" class="book-cta" :class="{ active: selSlot }">
            {{ selSlot ? `Записатись на ${selSlot}` : 'Оберіть час' }}
          </NuxtLink>
        </div>

        <!-- Floating chips -->
        <div class="chip chip-confirmed">
          <span class="chip-icon">✓</span>
          <div>
            <div class="chip-title">Запис підтверджено</div>
            <div class="chip-sub">Завтра 09:00 · Терапевт</div>
          </div>
        </div>

        <div class="chip chip-rating">
          <span class="chip-icon chip-star">★</span>
          <div>
            <div class="chip-title">4.9 з 5</div>
            <div class="chip-sub">342 відгуки</div>
          </div>
        </div>

        <!-- Deco ring -->
        <div class="deco-ring"></div>
      </div>
    </div>

    <!-- Scroll hint -->
    <div class="scroll-hint" :class="{ show: mounted }">
      <div class="scroll-line"></div>
      <span>гортайте</span>
    </div>
  </section>
</template>

<style scoped>
/* ── HERO ───────────────────────────────────── */
.hero {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
  background: var(--f0);
}

.hero-noise {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-repeat: repeat;
  opacity: 0.6;
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
  background: radial-gradient(circle, #b8e0c8 0%, transparent 70%);
  top: -200px;
  right: -150px;
  opacity: 0.5;
  animation: orb 12s ease-in-out infinite;
}
.hero-orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #e4d9c4 0%, transparent 70%);
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

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 10px;
  background: var(--g);
  color: white;
  font-family: var(--sans);
  font-size: 15.5px;
  font-weight: 600;
  box-shadow: 0 6px 28px rgba(22, 80, 47, 0.28);
  transition: all 0.2s;
}
.btn-hero:hover {
  background: var(--g1);
  transform: translateY(-2px);
  box-shadow: 0 10px 36px rgba(22, 80, 47, 0.33);
}
.btn-hero svg {
  transition: transform 0.2s;
}
.btn-hero:hover svg {
  transform: translateX(4px);
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
    border-color 0.15s,
    background 0.15s;
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
  font-family: var(--serif);
  font-size: 28px;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-weight: 400;
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
  height: 460px;
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
  border: 1px dashed var(--f2);
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

.book-card {
  position: absolute;
  top: 24px;
  left: 30px;
  right: 30px;
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

.chip {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 16px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--f2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
}
.chip-confirmed {
  bottom: 80px;
  left: -10px;
  animation: bob 5s ease-in-out infinite;
}
.chip-rating {
  bottom: 14px;
  right: 0;
  animation: bob 5s ease-in-out infinite 2.5s;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}
.chip-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.chip-star {
  color: var(--gol);
}
.chip-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
.chip-sub {
  font-size: 11.5px;
  color: var(--i4);
  margin-top: 1px;
}

/* ── Trust bar ──────────────────────────────── */
.trust-bar {
  background: var(--g);
  padding: 16px 0;
  overflow: hidden;
}
.trust-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  gap: 0;
  flex-wrap: wrap;
  justify-content: space-between;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}
.trust-icon {
  font-size: 18px;
}
.trust-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}
</style>
