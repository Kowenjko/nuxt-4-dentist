<script lang="ts" setup>
const { data: services, pending } = useAPI<ServiceI[]>(SERVICES)
const { open } = useBooking()

const fallbackServices = [
  { icon: '🦷', name: 'Стоматологія', duration: 60, price: 'від 800 ₴' },
  { icon: '🫀', name: 'Кардіологія', duration: 45, price: 'від 700 ₴' },
  { icon: '🧠', name: 'Неврологія', duration: 45, price: 'від 650 ₴' },
  { icon: '👁', name: 'Офтальмологія', duration: 30, price: 'від 600 ₴' },
  { icon: '🩻', name: 'УЗД', duration: 30, price: 'від 500 ₴' },
  { icon: '💊', name: 'Терапія', duration: 30, price: 'від 400 ₴' },
]

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

const servicesIcon = (n: string) => {
  const l = n.toLowerCase()
  return iconMap.find(([k]) => l.includes(k))?.[1] ?? '🦷'
}

const parseServices = computed(() =>
  services.value && services.value.length > 0
    ? services.value.slice(0, 6).map((s) => ({
        icon: servicesIcon(s.name),
        name: s.name,
        duration: s.duration,
        price: `${Number(s.price).toLocaleString('uk-UA')} ₴`,
      }))
    : fallbackServices
)
</script>

<template>
  <section id="services" class="sect services-sect">
    <div class="container">
      <div class="service-hd">
        <div>
          <div class="eyebrow">Напрямки</div>
          <h2 class="sect-h2">Наші послуги</h2>
        </div>
        <p class="sect-desc">
          Широкий спектр медичної допомоги.<br />
          Від профілактики до лікування.
        </p>
      </div>

      <div v-if="pending" class="svc-grid">
        <div v-for="i in 6" :key="i" class="skel"></div>
      </div>

      <div v-else class="svc-grid">
        <div
          v-for="(s, i) in parseServices"
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
          <Button @click="open()" class="svc-btn">Записатись →</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Services ───────────────────────────────── */
.services-sect {
  background: var(--f1);
}
.svc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.service-hd {
  text-align: center;
  margin-bottom: 56px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  text-align: left;
  margin-bottom: 52px;
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
  color: var(--black-50);
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
  color: var(--white-50);
  background: var(--g1);
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

/* Services grid */
@media (max-width: 980px) {
  .svc-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 640px) {
  .svc-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .service-hd {
    flex-direction: column;
    align-items: center;
  }
}
</style>
