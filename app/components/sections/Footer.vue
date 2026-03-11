<script lang="ts" setup>
const { isDark } = useTheme('client')
const { openApptPanel } = useBooking()

const navigation = [
  { name: 'Послуги', id: 'services' },
  { name: 'Лікарі', id: 'doctors' },
  { name: 'Як записатись', id: 'steps' },
  { name: 'Відгуки', id: 'reviews' },
]

const yr = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-wrap">
      <div class="footer-brand">
        <BrandButton :is-dark-text="isDark" />
        <p class="footer-tagline">Сучасна медицина<br />поруч із вами</p>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <div class="footer-col-hd">Клініка</div>
          <a v-for="item in navigation" :key="item.id" @click.prevent="scrollToId(item.id)">
            {{ item.name }}
          </a>
        </div>
        <div class="footer-col">
          <div class="footer-col-hd">Акаунт</div>
          <NuxtLink :to="LOGIN_LINK">Увійти</NuxtLink>
          <NuxtLink :to="REGISTER_LINK">Реєстрація</NuxtLink>
          <a @click="openApptPanel">Мої записи</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-hd">Контакти</div>
          <span>вул. Центральна, 15</span>
          <span>с. Борове, 34061</span>
          <span>+380 97 692 58 03</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="wrap footer-bottom-wrap">
        <span>© {{ yr }} КлінікаПлюс. Всі права захищено.</span>
        <span>Пн–Сб&nbsp;08:00–20:00</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* ── Footer ─────────────────────────────────── */
.footer {
  border-top: 1px solid var(--gray-400);
  background: var(--white-50);
}
.footer-wrap {
  display: flex;
  gap: 60px;
  justify-content: space-between;
  padding-top: 60px;
  padding-bottom: 48px;
  flex-wrap: wrap;
}
/* .footer-brand {
  flex-shrink: 0;
}
.footer-brand-link {
  color: white;
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 16px;
}
.footer-brand-link .brand-cross {
  color: #4caf7d;
}
.footer-brand-link em {
  color: #4caf7d;
} */
.footer-tagline {
  font-size: 13.5px;
  color: var(--gray-600);
  line-height: 1.7;
}
.footer-cols {
  display: flex;
  gap: 56px;
  flex-wrap: wrap;
}
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-col-hd {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--black-50);
  margin-bottom: 4px;
}
.footer-col a,
.footer-col span {
  font-size: 13.5px;
  color: var(--gray-600);
  cursor: pointer;
  transition: color 0.15s;
}
.footer-col a:hover {
  color: var(--black-50);
}
.footer-bottom {
  border-top: 1px solid var(--gray-400);
  padding: 18px 0;
}
.footer-bottom-wrap {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--gray-600);
  flex-wrap: wrap;
  gap: 8px;
}
</style>
