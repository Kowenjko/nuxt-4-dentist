<script lang="ts" setup>
const reviews = [
  {
    stars: 5,
    text: 'Записалась за 3 хвилини, лікар прийняв вчасно. Дуже зручно, що бачиш весь розклад онлайн.',
    name: 'Оксана М.',
    role: 'Пацієнт · Стоматологія',
  },
  {
    stars: 5,
    text: 'Нарешті не треба дзвонити! Обрала час, прийшла — і все чітко за розкладом. Рекомендую.',
    name: 'Андрій В.',
    role: 'Пацієнт · Стоматологія',
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
    role: 'Пацієнт · Стоматологія',
  },
  {
    stars: 5,
    text: 'Чудовий сервіс! Дитяча терапевт дуже уважна. Запис пройшов швидко та без нервів.',
    name: 'Наталя Р.',
    role: 'Пацієнт · Стоматологія',
  },
  {
    stars: 5,
    text: 'Сучасна система запису, ввічливий персонал, лікарі пояснюють все детально. Дякую!',
    name: 'Сергій Д.',
    role: 'Пацієнт · Стоматологія',
  },
]
</script>

<template>
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
</template>
<style scoped>
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
  color: var(--black-50);
}
.review-role {
  font-size: 12px;
  color: var(--i4);
  margin-top: 1px;
}
</style>
