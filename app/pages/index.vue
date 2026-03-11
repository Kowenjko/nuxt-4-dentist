<script setup lang="ts">
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
    <Reviews />
    <Cta />
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
/* ── Адаптив перенесено в responsive.css ── */
/* Тут лишаємо лише специфічні для index.vue правила */
@media (max-width: 980px) {
  .hero-wrap {
    grid-template-columns: 1fr;
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
