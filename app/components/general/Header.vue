<script lang="ts" setup>
const { isDark, toggle: toggleTheme } = useTheme('client')
const { isAuthenticated: isAuth, logout } = useAuth()
const { open, openApptPanel } = useBooking()

const scrolled = ref(false)
const menu = ref(false)

onMounted(() => {
  window.addEventListener(
    'scroll',
    () => {
      scrolled.value = window.scrollY > 50
    },
    { passive: true }
  )
})

const go = (id: string) => {
  menu.value = false
  nextTick(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
}
</script>

<template>
  <header class="nav" :class="{ stuck: scrolled }">
    <div class="nav-wrap">
      <NuxtLink to="/" class="brand">
        <svg class="brand-cross" viewBox="0 0 24 24" fill="none" width="22" height="22">
          <rect x="10" y="2" width="4" height="20" rx="2" fill="currentColor" />
          <rect x="2" y="10" width="20" height="4" rx="2" fill="currentColor" />
        </svg>
        <span>Клініка<em>Плюс</em></span>
      </NuxtLink>

      <nav class="nav-links">
        <a @click.prevent="go('services')">Послуги</a>
        <a @click.prevent="go('doctors')">Лікарі</a>
        <a @click.prevent="go('steps')">Як записатись</a>
        <a @click.prevent="go('reviews')">Відгуки</a>
      </nav>

      <div class="nav-end">
        <button
          class="theme-toggle compact"
          @click="toggleTheme"
          :title="isDark ? 'Світла тема' : 'Темна тема'"
        >
          <span class="t-icon-light" v-if="isDark">☀️</span>
          <span class="t-icon-dark" v-else>🌙</span>
        </button>
        <BaseButton v-if="isAuth" @click="openApptPanel" variant="outline">Мої записи</BaseButton>
        <NuxtLink v-else to="/login" class="btn-line">Увійти</NuxtLink>
        <BaseButton @click="logout">Вийти</BaseButton>
        <NuxtLink to="/register" class="btn-solid">Записатись →</NuxtLink>
      </div>

      <button class="burger" :class="{ open: menu }" @click="menu = !menu" aria-label="Меню">
        <span /><span /><span />
      </button>
    </div>

    <Transition name="slide">
      <div v-if="menu" class="mob-menu">
        <a @click="go('services')">Послуги</a>
        <a @click="go('doctors')">Лікарі</a>
        <a @click="go('steps')">Як записатись</a>
        <a @click="go('reviews')">Відгуки</a>
        <div class="mob-btns">
          <NuxtLink to="/login" class="btn-line">Увійти</NuxtLink>
          <NuxtLink to="/register" class="btn-solid">Записатись</NuxtLink>
          <button class="theme-toggle mob-theme-toggle" @click="toggleTheme">
            <span v-if="isDark">☀️</span><span v-else>🌙</span>
            <span class="t-label">{{ isDark ? 'Світла тема' : 'Темна тема' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>
