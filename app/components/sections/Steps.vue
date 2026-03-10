<script lang="ts" setup>
const { open } = useBooking()

const steps = [
  {
    icon: '👤',
    title: 'Створіть акаунт',
    desc: "Реєстрація займає менше хвилини. Лише ваше ім'я та email — і ви в системі.",
  },
  {
    icon: '📅',
    title: 'Оберіть лікаря та час',
    desc: 'Перегляньте профілі лікарів, знайдіть вільний слот і виберіть зручний час для візиту.',
  },
  {
    icon: '✅',
    title: 'Отримайте підтвердження',
    desc: 'Запис підтверджується миттєво. Ми надішлемо нагадування за день до прийому.',
  },
]
</script>

<template>
  <section id="steps" class="sect steps-sect">
    <div class="container">
      <div class="steps-inner">
        <div class="steps-left">
          <div class="eyebrow">Процес</div>
          <h2 class="sect-h2 steps-h2">Три кроки до вашого здоров'я</h2>
          <p class="sect-p">
            Ми зробили запис максимально простим — без черг, без дзвінків, без зайвих кроків.
          </p>
          <Button @click="open()" class="steps-cta"> Спробувати безкоштовно → </Button>
        </div>

        <div class="steps-right">
          <div
            v-for="(st, i) in steps"
            :key="i"
            class="step reveal"
            :style="`transition-delay:${i * 120}ms`"
          >
            <div class="step-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="step-body">
              <div class="step-icon">{{ st.icon }}</div>
              <h3 class="step-title">{{ st.title }}</h3>
              <p class="step-desc">{{ st.desc }}</p>
            </div>
            <div v-if="i < steps.length - 1" class="step-line"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
/* ── Steps ──────────────────────────────────── */
.steps-sect {
  background: var(--f1);
}
.steps-inner {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 80px;
  align-items: center;
}
.steps-h2 {
  margin-bottom: 16px;
}
.steps-cta {
  margin-top: 36px;
  display: inline-block;
}

.steps-right {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.step {
  position: relative;
  display: flex;
  gap: 20px;
  padding-bottom: 36px;
}
.step:last-child {
  padding-bottom: 0;
}
.step-num {
  font-family: var(--serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--g1);
  min-width: 28px;
  padding-top: 4px;
  letter-spacing: 0.02em;
}
.step-body {
  flex: 1;
}
.step-icon {
  font-size: 26px;
  margin-bottom: 10px;
}
.step-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 400;
  color: var(--ink);
  margin-bottom: 7px;
}
.step-desc {
  font-size: 14.5px;
  color: var(--i3);
  line-height: 1.7;
}
.step-line {
  position: absolute;
  left: 13px;
  top: 50px;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, var(--gl), transparent);
}
</style>
