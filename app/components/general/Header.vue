<script lang="ts" setup>
import { LogInIcon, LogOutIcon } from 'lucide-vue-next'

const { isDark, toggle: toggleTheme } = useTheme('client')
const { isAuthenticated: isAuth, logout } = useAuth()
const { openApptPanel, open } = useBooking()
const { y: scrollY } = useWindowScroll()

const menu = shallowRef(false)
const menuRef = useTemplateRef('menuRef')

const route = useRoute()

const hideNav = computed(() => [LOGIN_LINK.name, REGISTER_LINK.name].includes(route.name as any))

onClickOutside(menuRef, () => (menu.value = false))

const openPanel = () => {
  if (isAuth.value) openApptPanel()
  else navigateTo(LOGIN_LINK)
}
const openBooking = () => {
  if (isAuth.value) open()
  else navigateTo(LOGIN_LINK)
}

const scrolled = computed(() => scrollY.value > 10)

const navigation = [
  { name: 'Послуги', id: 'services' },
  { name: 'Лікарі', id: 'doctors' },
  { name: 'Як записатись', id: 'steps' },
  { name: 'Відгуки', id: 'reviews' },
]

const go = (id: string) => {
  menu.value = false
  scrollToId(id)
}

const goToLogin = () => {
  menu.value = false
  navigateTo(LOGIN_LINK)
}

const logoutUser = () => {
  logout()
  menu.value = false
}
</script>

<template>
  <header class="nav" :class="{ stuck: scrolled }">
    <div class="nav-wrap container">
      <BrandButton :is-dark-text="isDark && scrolled" />

      <nav class="nav-links" v-if="!hideNav">
        <a v-for="item in navigation" @click.prevent="go(item.id)" :key="item.id">{{
          item.name
        }}</a>
      </nav>

      <div class="nav-end" v-if="!hideNav">
        <Button v-if="isAuth" @click="openPanel" size="sm">Мої записи</Button>
        <Button @click="openBooking" size="sm">Записатись →</Button>

        <ThemeButton :isDark="isDark" @click="toggleTheme" size="sm" />

        <Button v-if="isAuth" variant="ghost" @click="logout" title="Вихід">
          <LogOutIcon />
        </Button>
        <Button v-else :to="LOGIN_LINK" variant="ghost" title="Вхід"> <LogInIcon /></Button>
      </div>

      <BurgerButton :menu @click="menu = !menu" />
    </div>

    <Transition name="slide">
      <ul v-if="menu" class="mob-menu" ref="menuRef">
        <li v-for="item in navigation" :key="item.id">
          <a @click="go(item.id)">{{ item.name }}</a>
        </li>
        <div class="mob-btns">
          <Button v-if="isAuth" @click="logoutUser" variant="outline" title="Вихід"> Вийти</Button>
          <Button v-else @click="goToLogin" variant="outline" title="Вхід"> Увійти</Button>

          <Button v-if="isAuth" @click="openPanel">Мої записи</Button>
          <Button @click="openBooking">Записатись</Button>

          <ThemeButton :isDark="isDark" @click="toggleTheme" is-label variant="outline" />
        </div>
      </ul>
    </Transition>
  </header>
</template>
<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 300;
  transition:
    background 0.3s,
    border-color 0.3s,
    backdrop-filter 0.3s;
}
.nav.stuck {
  background: rgba(250, 249, 246, 0.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--f2);
}
.nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.nav-links {
  display: flex;
  gap: 30px;
}
.nav-links a {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--i3);
  cursor: pointer;
  transition: color 0.15s;
  letter-spacing: 0.01em;
}
.nav-links a:hover {
  color: var(--ink);
}

.nav-end {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mob-menu {
  background: var(--f0);
  border-top: 1px solid var(--f2);
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mob-menu a,
.mob-menu button {
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    color: var(--g2);
  }
}
.mob-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
