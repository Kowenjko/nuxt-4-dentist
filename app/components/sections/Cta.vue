<script lang="ts" setup>
const { open } = useBooking()
</script>

<template>
  <section class="cta-sect">
    <div class="cta-noise"></div>
    <div class="cta-orb-1"></div>
    <div class="cta-orb-2"></div>
    <div class="container cta-inner">
      <h2 class="cta-h2">Готові розпочати?</h2>
      <p class="cta-p">Запишіться онлайн за 2 хвилини — без черг і телефонних дзвінків.</p>
      <div class="cta-btns">
        <NuxtLink to="/register" class="btn-cta-main">Створити акаунт безкоштовно</NuxtLink>
        <a @click="open()" class="btn-cta-ghost">Вже маєте акаунт →</a>
      </div>
    </div>
  </section>
</template>
<style scoped>
/* ── CTA section ────────────────────────────── */
.cta-sect {
  position: relative;
  overflow: hidden;
  background: var(--g);
  padding: 96px 0;
}

.cta-sect::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.1) 1px, transparent 0),
    radial-gradient(circle at 3px 3px, rgba(0, 0, 0, 0.1) 1px, transparent 0);
  background-size:
    4px 4px,
    6px 6px;
  mix-blend-mode: multiply;
}

.cta-orb-1,
.cta-orb-2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.cta-orb-1 {
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.06);
  top: -150px;
  right: 50px;
}
.cta-orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.04);
  bottom: -80px;
  left: 80px;
}
.cta-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}
.cta-h2 {
  font-family: var(--serif);
  font-size: clamp(28px, 4vw, 48px);
  color: white;
  margin-bottom: 14px;
  letter-spacing: -0.02em;
  font-weight: 400;
}
.cta-p {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  line-height: 1.7;
}
.cta-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.btn-cta-main {
  display: inline-flex;
  align-items: center;
  padding: 15px 36px;
  border-radius: 10px;
  background: white;
  color: var(--g);
  font-family: var(--sans);
  font-size: 15.5px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.2);
}
.btn-cta-main:hover {
  background: var(--f1);
  transform: translateY(-2px);
}
.btn-cta-ghost {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.15s;
  cursor: pointer;
}
.btn-cta-ghost:hover {
  color: white;
}
</style>
