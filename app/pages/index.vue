<script setup lang="ts">
// ── State ─────────────────────────────────────
const loadingSvc = ref(true)
const loadingDoc = ref(true)

// ── Data ──────────────────────────────────────
const services = ref<any[]>([])
const doctors = ref<any[]>([])

const iconMap: [string, string][] = [
  ['стоматол', '🦷'],
  ['кардіол', '🫀'],
  ['невролог', '🧠'],
  ['офтальмол', '👁'],
  ['узд', '🩻'],
  ['терап', '💊'],
  ['хірург', '🔬'],
  ['ортопед', '🦴'],
  ['гінекол', '🌸'],
  ['педіатр', '👶'],
  ['уролог', '💧'],
  ['ендокринол', '⚗️'],
  ['дерматол', '🧴'],
  ['алергол', '🌿'],
  ['психіатр', '🕊️'],
]
const svcIcon = (n: string) => {
  const l = n.toLowerCase()
  return iconMap.find(([k]) => l.includes(k))?.[1] ?? '🦷'
}

const fallbackSvcs = [
  { icon: '🦷', name: 'Стоматологія', duration: 60, price: 'від 800 ₴' },
  { icon: '🫀', name: 'Кардіологія', duration: 45, price: 'від 700 ₴' },
  { icon: '🧠', name: 'Неврологія', duration: 45, price: 'від 650 ₴' },
  { icon: '👁', name: 'Офтальмологія', duration: 30, price: 'від 600 ₴' },
  { icon: '🩻', name: 'УЗД', duration: 30, price: 'від 500 ₴' },
  { icon: '💊', name: 'Терапія', duration: 30, price: 'від 400 ₴' },
]
const fallbackDocs = [
  {
    id: '',
    name: 'Олена Савченко',
    specialty: 'Терапевт · Кардіолог',
    bio: '10 років досвіду, кандидат медичних наук',
    tags: ['Терапія', 'ЕКГ', 'Холтер'],
  },
  {
    id: '',
    name: 'Микола Бондар',
    specialty: 'Невролог',
    bio: 'Спеціаліст з болей у спині та головних болях',
    tags: ['Неврологія', 'МРТ'],
  },
  {
    id: '',
    name: 'Ірина Коваль',
    specialty: 'Стоматолог',
    bio: 'Естетична та відновлювальна стоматологія',
    tags: ['Лікування', 'Вибілення'],
  },
  {
    id: '',
    name: 'Андрій Мельник',
    specialty: 'Ортопед',
    bio: 'Операції та консервативне лікування суглобів',
    tags: ['Суглоби', 'УЗД'],
  },
]

const displaySvcs = computed(() =>
  services.value.length
    ? services.value.slice(0, 6).map((s) => ({
        icon: svcIcon(s.name),
        name: s.name,
        duration: s.duration,
        price: `${Number(s.price).toLocaleString('uk-UA')} ₴`,
      }))
    : fallbackSvcs
)
const displayDocs = computed(() =>
  doctors.value.length
    ? doctors.value.slice(0, 4).map((d) => ({
        id: d.id,
        name: d.user?.name || '—',
        specialty: d.specialty,
        bio: d.bio || '',
        tags: (d.services || []).slice(0, 3).map((s: any) => s.name),
      }))
    : fallbackDocs
)

const ini = (n: string) =>
  (n || '??')
    .split(' ')
    .map((x: string) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const trusts = [
  { icon: '🏥', label: 'Ліцензована клініка' },
  { icon: '👨‍⚕️', label: 'Сертифіковані лікарі' },
  { icon: '🔒', label: 'Конфіденційність даних' },
  { icon: '⏱', label: 'Запис за 2 хвилини' },
  { icon: '💬', label: 'Онлайн-нагадування' },
  { icon: '🌐', label: 'Доступно 24/7' },
]

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

  // Fetch data
  try {
    services.value = (await $fetch('/api/services')) as any[]
  } catch {}
  loadingSvc.value = false

  try {
    doctors.value = (await $fetch('/api/doctors')) as any[]
  } catch {}
  loadingDoc.value = false

  // Re-observe after data loads
  await nextTick()
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
})
</script>
<template>
  <div class="root">
    <Hero />

    <!-- ─── TRUST BAR ─────────────────────────────────── -->
    <div class="trust-bar">
      <div class="trust-wrap">
        <div v-for="t in trusts" :key="t.label" class="trust-item">
          <span class="trust-icon">{{ t.icon }}</span>
          <span class="trust-label">{{ t.label }}</span>
        </div>
      </div>
    </div>

    <!-- ─── SERVICES ──────────────────────────────────── -->
    <section id="services" class="sect services-sect">
      <div class="container">
        <div class="sect-hd sect-hd-split">
          <div>
            <div class="eyebrow">Напрямки</div>
            <h2 class="sect-h2">Наші послуги</h2>
          </div>
          <p class="sect-desc">
            Широкий спектр медичної допомоги.<br />
            Від профілактики до лікування.
          </p>
        </div>

        <div v-if="loadingSvc" class="svc-grid">
          <div v-for="i in 6" :key="i" class="skel"></div>
        </div>

        <div v-else class="svc-grid">
          <div
            v-for="(s, i) in displaySvcs"
            :key="i"
            class="svc-card reveal"
            :style="`transition-delay:${i * 60}ms`"
          >
            <div class="svc-ico">{{ s.icon }}</div>
            <h3 class="svc-name">{{ s.name }}</h3>
            <div class="svc-row">
              <span class="svc-dur">{{ s.duration }} хв</span>
              <span class="svc-price">{{ s.price }}</span>
            </div>
            <NuxtLink to="/register" class="svc-btn">Записатись →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── DOCTORS ───────────────────────────────────── -->
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

        <div v-if="loadingDoc" class="doc-grid">
          <div v-for="i in 4" :key="i" class="skel skel-tall"></div>
        </div>

        <div v-else class="doc-grid">
          <div
            v-for="(d, i) in displayDocs"
            :key="d.id || i"
            class="doc-card reveal"
            :style="`transition-delay:${i * 80}ms`"
          >
            <div class="doc-av-wrap">
              <div class="doc-av">{{ ini(d.name) }}</div>
              <div class="doc-av-ring"></div>
            </div>
            <h3 class="doc-name">{{ d.name }}</h3>
            <div class="doc-spec">{{ d.specialty }}</div>
            <p v-if="d.bio" class="doc-bio">{{ d.bio }}</p>
            <div class="doc-tags">
              <span v-for="t in d.tags" :key="t" class="doc-tag">{{ t }}</span>
            </div>
            <NuxtLink :to="`/register?doctor=${d.id || ''}`" class="doc-book">Записатись</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ──────────────────────────────── -->
    <section id="steps" class="sect steps-sect">
      <div class="container">
        <div class="steps-inner">
          <div class="steps-left">
            <div class="eyebrow">Процес</div>
            <h2 class="sect-h2 steps-h2">Три кроки до вашого здоров'я</h2>
            <p class="sect-p">
              Ми зробили запис максимально простим — без черг, без дзвінків, без зайвих кроків.
            </p>
            <NuxtLink to="/register" class="btn-solid steps-cta">
              Спробувати безкоштовно →
            </NuxtLink>
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

/* ── Services ───────────────────────────────── */
.services-sect {
  background: var(--f1);
}
.svc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.skel {
  border-radius: 14px;
  height: 180px;
  background: linear-gradient(90deg, var(--f2) 25%, var(--f3) 50%, var(--f2) 75%);
  background-size: 400% 100%;
  animation: shimmer 1.6s linear infinite;
}
.skel-tall {
  height: 280px;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.svc-card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--f2);
  padding: 26px 22px;
  transition: all 0.28s;
}
.svc-card:hover {
  border-color: var(--gl);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.07);
  transform: translateY(-3px);
}
.svc-ico {
  font-size: 30px;
  margin-bottom: 14px;
}
.svc-name {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 400;
  color: var(--ink);
  margin-bottom: 12px;
}
.svc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.svc-dur {
  font-size: 12.5px;
  color: var(--i4);
  background: var(--f1);
  padding: 3px 10px;
  border-radius: 20px;
}
.svc-price {
  margin-left: auto;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--g1);
}
.svc-btn {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--g1);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.15s;
}
.svc-btn:hover {
  gap: 8px;
}

/* ── Doctors ────────────────────────────────── */
.doctors-sect {
  background: var(--f0);
}
.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}
.doc-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--f2);
  padding: 30px 24px;
  text-align: center;
  transition: all 0.28s;
}
.doc-card:hover {
  border-color: var(--gl);
  box-shadow: 0 12px 44px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}
.doc-av-wrap {
  position: relative;
  width: 72px;
  margin: 0 auto 18px;
}
.doc-av {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: var(--gx);
  color: var(--g);
  font-family: var(--serif);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doc-av-ring {
  position: absolute;
  inset: -5px;
  border-radius: 22px;
  border: 1.5px dashed var(--gl);
  animation: spin-slow 20s linear infinite;
}
.doc-name {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 400;
  color: var(--ink);
  margin-bottom: 5px;
}
.doc-spec {
  font-size: 13px;
  font-weight: 600;
  color: var(--g1);
  margin-bottom: 10px;
}
.doc-bio {
  font-size: 13.5px;
  color: var(--i3);
  line-height: 1.65;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.doc-tags {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.doc-tag {
  font-size: 11.5px;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--f1);
  color: var(--i3);
}
.doc-book {
  display: block;
  padding: 10px;
  background: var(--gx);
  color: var(--g);
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
}
.doc-book:hover {
  background: var(--g);
  color: white;
}

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
