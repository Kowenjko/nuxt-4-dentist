<script setup lang="ts">
const reviews = [
  {
    stars: 5,
    text: 'Записалась за 3 хвилини, лікар прийняв вчасно. Дуже зручно, що бачиш весь розклад онлайн.',
    name: 'Оксана М.',
    role: 'Пацієнт · Кардіологія',
  },
  {
    stars: 5,
    text: 'Нарешті не треба дзвонити! Обрала час, прийшла — і все чітко за розкладом. Рекомендую.',
    name: 'Андрій В.',
    role: 'Пацієнт · Терапія',
  },
  {
    stars: 5,
    text: 'Відмінна клініка. Уважні лікарі, чисто, сучасне обладнання. Приводжу всю родину.',
    name: 'Марія Л.',
    role: 'Пацієнт · Стоматологія',
  },
  {
    stars: 5,
    text: 'Зручно, що вся історія записів зберігається в акаунті. Більше не треба тримати папірці.',
    name: 'Ігор К.',
    role: 'Пацієнт · Ортопедія',
  },
  {
    stars: 5,
    text: 'Чудовий сервіс! Дитяча терапевт дуже уважна. Запис пройшов швидко та без нервів.',
    name: 'Наталя Р.',
    role: 'Пацієнт · Педіатрія',
  },
  {
    stars: 5,
    text: 'Сучасна система запису, ввічливий персонал, лікарі пояснюють все детально. Дякую!',
    name: 'Сергій Д.',
    role: 'Пацієнт · Неврологія',
  },
]

// ── Lifecycle ─────────────────────────────────
onMounted(async () => {
  // Intersection Observer for reveal animations
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('in')
      }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

  await nextTick()
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
})
</script>
<template>
  <div class="root">
    <Hero />
    <TrustBar />
    <Services />
    <Doctors />
    <Steps />

    <!-- ─── REVIEWS ───────────────────────────────────── -->
    <section id="reviews" class="sect reviews-sect">
      <div class="container">
        <div class="sect-hd">
          <div class="eyebrow">Відгуки</div>
          <h2 class="sect-h2">Нам довіряють</h2>
        </div>

        <div class="reviews-grid">
          <div
            v-for="(r, i) in reviews"
            :key="i"
            class="review-card reveal"
            :style="`transition-delay:${i * 80}ms`"
          >
            <div class="review-stars">{{ '★'.repeat(r.stars) }}</div>
            <p class="review-text">"{{ r.text }}"</p>
            <div class="review-foot">
              <div class="review-av">{{ r.name[0] }}</div>
              <div>
                <div class="review-name">{{ r.name }}</div>
                <div class="review-role">{{ r.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ───────────────────────────────────────── -->
    <section class="cta-sect">
      <div class="cta-noise"></div>
      <div class="cta-orb-1"></div>
      <div class="cta-orb-2"></div>
      <div class="container cta-inner">
        <h2 class="cta-h2">Готові розпочати?</h2>
        <p class="cta-p">Запишіться онлайн за 2 хвилини — без черг і телефонних дзвінків.</p>
        <div class="cta-btns">
          <NuxtLink to="/register" class="btn-cta-main">Створити акаунт безкоштовно</NuxtLink>
          <NuxtLink to="/login" class="btn-cta-ghost">Вже маєте акаунт →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
/* ── Sections common ────────────────────────── */
.sect {
  padding: 100px 0;
}
.sect-hd {
  text-align: center;
  margin-bottom: 56px;
}
.sect-hd-split {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  text-align: left;
  margin-bottom: 52px;
}
.eyebrow {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--g1);
  background: var(--gx);
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 12px;
}
.sect-h2 {
  font-family: var(--serif);
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--ink);
  font-weight: 400;
}
.sect-desc {
  font-size: 16px;
  color: var(--i3);
  line-height: 1.7;
  max-width: 360px;
}
.sect-p {
  font-size: 16px;
  color: var(--i3);
  line-height: 1.75;
  max-width: 560px;
  margin: 12px auto 0;
}

/* ── Reviews ────────────────────────────────── */
.reviews-sect {
  background: var(--f0);
}
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.review-card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--f2);
  padding: 28px 22px;
  transition: all 0.25s;
}
.review-card:hover {
  border-color: var(--gl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
.review-stars {
  color: var(--gol);
  font-size: 15px;
  letter-spacing: 3px;
  margin-bottom: 14px;
}
.review-text {
  font-family: var(--serif);
  font-size: 15.5px;
  color: var(--i2);
  line-height: 1.75;
  margin-bottom: 20px;
  font-style: italic;
}
.review-foot {
  display: flex;
  align-items: center;
  gap: 12px;
}
.review-av {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--f1);
  color: var(--i3);
  font-family: var(--serif);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.review-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
}
.review-role {
  font-size: 12px;
  color: var(--i4);
  margin-top: 1px;
}

/* ── CTA section ────────────────────────────── */
.cta-sect {
  position: relative;
  overflow: hidden;
  background: var(--g);
  padding: 96px 0;
}
.cta-noise {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
  opacity: 0.5;
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
}
.btn-cta-ghost:hover {
  color: white;
}

/* ── Reveal animations ──────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.6s var(--ease),
    transform 0.6s var(--ease);
}
.reveal.in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Responsive ─────────────────────────────── */
/* ── Адаптив перенесено в responsive.css ── */
/* Тут лишаємо лише специфічні для index.vue правила */
@media (max-width: 980px) {
  .hero-wrap {
    grid-template-columns: 1fr;
  }
  .hero-right {
    display: none;
  }
  .hero-h1 {
    font-size: clamp(34px, 7vw, 52px);
  }
  .steps-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .reviews-grid {
    grid-template-columns: 1fr 1fr;
  }
  .trust-wrap {
    justify-content: center;
  }
  .sect-hd-split {
    flex-direction: column;
    gap: 12px;
  }
  .nav-links,
  .nav-end {
    display: none !important;
  }
  .burger {
    display: flex !important;
  }
}

@media (max-width: 768px) {
  .sect {
    padding: 72px 0;
  }
  .sect-h2 {
    font-size: clamp(24px, 5.5vw, 34px);
  }
  .sect-hd {
    margin-bottom: 40px;
  }
  .svc-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  .doc-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .sect {
    padding: 56px 0;
  }
  .hero {
    padding: 80px 0 48px;
    min-height: auto;
  }
  .hero-h1 {
    font-size: clamp(26px, 8vw, 38px);
  }
  .hero-sub {
    font-size: 15px;
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .hero-actions a,
  .hero-actions button {
    width: 100%;
    justify-content: center;
  }
  .hero-nums {
    flex-wrap: wrap;
    gap: 16px;
  }
  .hero-num {
    min-width: calc(50% - 8px);
  }
  .reviews-grid {
    grid-template-columns: 1fr;
  }
  .svc-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .doc-grid {
    grid-template-columns: 1fr;
  }
  .footer-wrap {
    flex-direction: column;
    gap: 36px;
    padding: 48px 0 32px;
  }
  .footer-cols {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .trust-item {
    width: 50%;
  }
}

@media (max-width: 480px) {
  .sect {
    padding: 48px 0;
  }
  .hero {
    padding: 72px 0 40px;
  }
  .sect-h2 {
    font-size: clamp(20px, 7vw, 28px);
  }
  .sect-desc,
  .sect-p {
    font-size: 14px;
  }
  .trust-item {
    width: 100%;
  }
  .hero-num {
    min-width: calc(50% - 8px);
  }
  .footer-cols {
    grid-template-columns: 1fr;
  }
  .footer-copy {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 360px) {
  .hero-h1 {
    font-size: 24px;
  }
  .hero-sub {
    font-size: 13.5px;
  }
  .hero-num {
    min-width: 100%;
  }
}
</style>
