<script setup lang="ts">
import {
  Grid2X2Icon,
  User2Icon,
  StethoscopeIcon,
  StarIcon,
  CalendarClockIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-vue-next'

const sidebarOpen = ref(false)

const menu = [
  { name: 'Дашборд', to: ADMIN_LINK, icon: Grid2X2Icon },
  { name: 'Користувачі', to: ADMIN_USERS_LINK, icon: User2Icon },
  { name: 'Лікарі', to: ADMIN_DOCTORS_LINK, icon: StethoscopeIcon },
  { name: 'Послуги', to: ADMIN_SERVICES_LINK, icon: StarIcon },
  { name: 'Записи', to: ADMIN_APPOINTMENTS_LINK, icon: CalendarClockIcon },
]

const { user, logout, token, fetchUser, isAuthenticated, isAdmin } = useAuth()
const { isDark, toggle: toggleTheme, init: initTheme, applyFor } = useTheme('admin')
const route = useRoute()

onMounted(async () => {
  initTheme()
  applyFor('admin')

  if (token.value && !isAuthenticated.value) await fetchUser()
  if (!isAuthenticated.value || !isAdmin.value) return navigateTo(LOGIN_LINK)
})

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
</script>

<template>
  <div class="shell">
    <!-- Mobile top header (hidden on desktop via CSS) -->
    <header class="admin-topbar">
      <button
        class="admin-burger"
        :class="{ 'is-open': sidebarOpen }"
        @click="sidebarOpen = !sidebarOpen"
        aria-label="Меню"
      >
        <span /><span /><span />
      </button>

      <BrandButton />
      <button
        class="theme-toggle compact"
        @click="toggleTheme"
        :title="isDark ? 'Світла' : 'Темна'"
      >
        <span v-if="isDark"><SunIcon /></span><span v-else><MoonIcon /></span>
      </button>
    </header>
    <!-- Overlay — ДО sidebar в DOM, sidebar перекриває його через z-index -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

    <aside class="sidebar" :class="{ 'is-open': sidebarOpen }">
      <div class="sidebar-logo">
        <BrandButton />
      </div>

      <nav class="admin-nav">
        <NuxtLink
          v-for="(nav, i) in menu"
          :key="i"
          :to="nav.to"
          @click="sidebarOpen = false"
          class="admin-nav-link"
          active-class="is-active"
        >
          <component v-if="nav.icon" :is="nav.icon" />
          <span>{{ nav.name }}</span>
        </NuxtLink>
      </nav>

      <!-- Theme toggle -->
      <button
        class="theme-toggle sidebar-theme-toggle"
        @click="toggleTheme"
        :title="isDark ? 'Світла тема' : 'Темна тема'"
      >
        <span v-if="isDark"><SunIcon /></span><span v-else><MoonIcon /></span>
        <span class="t-label">{{ isDark ? 'Світла' : 'Темна' }} тема</span>
      </button>

      <div class="sidebar-footer">
        <div class="user-pill">
          <div class="user-avatar">{{ iniAvatar(user?.name) }}</div>
          <div class="user-info">
            <div class="user-name">{{ user?.name }}</div>
            <div class="user-role">Адміністратор</div>
          </div>
        </div>
        <button class="logout-btn" @click="logout" title="Вийти">
          <LogOutIcon />
        </button>
      </div>
    </aside>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style>
/* Шрифти підключені в main.css */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CSS-змінні визначені в main.css */

html,
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.5;
}
a {
  text-decoration: none;
  color: inherit;
}
button {
  font-family: var(--sans);
}
input,
select,
textarea {
  font-family: var(--sans);
}

.shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-w);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  /* 400 — завжди вище overlay (200) і topbar (180) */
  z-index: 400;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid var(--border);
}
.logo-icon {
  font-size: 20px;
  color: var(--accent);
  line-height: 1;
}
.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.04em;
}

.admin-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text-2);
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.12s;
}
.admin-nav-link:hover {
  color: var(--text);
  background: var(--surface2);
}
.admin-nav-link.is-active {
  color: var(--accent);
  background: var(--accent-bg);
}
.admin-nav-link svg {
  flex-shrink: 0;
  opacity: 0.8;
}
.admin-nav-link.is-active svg {
  opacity: 1;
}

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
}
.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--accent-dim);
  color: var(--accent);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-info {
  min-width: 0;
}
.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 11px;
  color: var(--text-3);
}

.logout-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px;
  color: var(--text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.12s;
  flex-shrink: 0;
}
.logout-btn:hover {
  color: var(--danger);
  border-color: var(--danger);
  background: var(--danger-bg);
}
.sidebar-theme-toggle {
  width: calc(100% - 24px);
  margin: 0 12px 8px;
  justify-content: flex-start;
  gap: 10px;
  padding: 9px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.main {
  margin-left: var(--sidebar-w);
  flex: 1;
  padding: 28px 32px;
  min-height: 100vh;
}

.page-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
.page-sub {
  font-size: 12.5px;
  color: var(--text-3);
  margin-top: 3px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 16px;
}
.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-val {
  font-size: 26px;
  font-weight: 700;
  font-family: var(--mono);
  color: var(--text);
  margin-top: 6px;
  letter-spacing: -0.04em;
}
.stat-sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 3px;
}
.stat-accent .stat-val {
  color: var(--accent);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}
.card-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
thead th {
  text-align: left;
  padding: 9px 16px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  background: var(--bg);
}
tbody td {
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  vertical-align: middle;
}
tbody tr:last-child td {
  border-bottom: none;
}
tbody tr:hover td {
  background: var(--surface2);
}

.inp {
  padding: 7px 11px;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--sans);
  font-size: 13px;
  outline: none;
  transition: border-color 0.12s;
}
.inp:focus {
  border-color: var(--accent);
}
.inp::placeholder {
  color: var(--text-3);
}
.inp-search {
  width: 220px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
  text-decoration: none;
}
.btn svg {
  width: 14px;
  height: 14px;
}
.btn-primary {
  background: var(--accent);
  color: #000;
}
.btn-primary:hover {
  background: #52e896;
}
.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border2);
}
.btn-ghost:hover {
  background: var(--surface2);
  color: var(--text);
}
.btn-danger {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid transparent;
}
.btn-danger:hover {
  border-color: var(--danger);
}
.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--mono);
  white-space: nowrap;
}
.badge-admin {
  background: #1a1e3d;
  color: #7b9cff;
}
.badge-doctor {
  background: var(--accent-bg);
  color: var(--accent);
}
.badge-client {
  background: var(--surface2);
  color: var(--text-2);
}
.badge-confirmed {
  background: var(--accent-bg);
  color: var(--accent);
}
.badge-pending {
  background: var(--warning-bg);
  color: var(--warning);
}
.badge-cancelled {
  background: var(--danger-bg);
  color: var(--danger);
}
.badge-neutral {
  background: var(--surface2);
  color: var(--text-2);
}

.av {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: var(--surface2);
  color: var(--text-2);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--mono);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.av-green {
  background: var(--accent-bg);
  color: var(--accent);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.uc-name {
  font-weight: 600;
  font-size: 13px;
}
.uc-sub {
  font-size: 11.5px;
  color: var(--text-3);
}

/* .pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  font-size: 12.5px;
  color: var(--text-3);
}
.pg-btns {
  display: flex;
  gap: 4px;
} */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
}
.modal-lg {
  max-width: 640px;
}
.modal-sm {
  max-width: 380px;
}
.modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border);
}
.modal-title {
  font-size: 15px;
  font-weight: 600;
}
.modal-x {
  background: none;
  border: none;
  color: var(--text-3);
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}
.modal-x:hover {
  color: var(--text);
}
.modal-body {
  padding: 22px;
}
.modal-ft {
  padding: 14px 22px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* .fg {
  margin-bottom: 14px;
}
.fg:last-child {
  margin-bottom: 0;
}
.fl {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-3);
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.fi {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--sans);
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.12s;
}
.fi:focus {
  border-color: var(--accent);
}
.fi::placeholder {
  color: var(--text-3);
} */
.fi-mono {
  font-family: var(--mono);
}
.fi-ta {
  min-height: 80px;
  resize: vertical;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.alert {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 14px;
  border: 1px solid;
}
.alert-error {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: #4d1a1a;
}
.alert-success {
  background: var(--accent-bg);
  color: var(--accent);
  border-color: var(--accent-dim);
}

.empty {
  text-align: center;
  padding: 52px 20px;
  color: var(--text-3);
}
.empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.3;
}
.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-2);
}
.empty-sub {
  font-size: 12.5px;
  margin-top: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-3);
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 6px;
}
.mono {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-2);
}

.sched-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-bottom: 6px;
  transition: opacity 0.15s;
}
.sched-row.off {
  opacity: 0.4;
}
.sched-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.sched-toggle input {
  accent-color: var(--accent);
}
.sched-day {
  font-size: 13px;
  font-weight: 500;
  min-width: 28px;
}
.sched-times {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time-inp {
  padding: 4px 8px;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: 5px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 12.5px;
  outline: none;
  width: 80px;
}
.time-inp:focus {
  border-color: var(--accent);
}
.time-inp:disabled {
  opacity: 0.3;
}

.svc-list {
  border: 1px solid var(--border);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 6px;
}
.svc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.svc-item:hover {
  background: var(--surface2);
}
.svc-item input {
  accent-color: var(--accent);
}
.svc-price {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--text-3);
}

.status-sel {
  padding: 3px 8px;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  outline: none;
  background: var(--surface2);
}
.status-sel.s-pending {
  background: var(--warning-bg);
  color: var(--warning);
}
.status-sel.s-confirmed {
  background: var(--accent-bg);
  color: var(--accent);
}
.status-sel.s-cancelled {
  background: var(--danger-bg);
  color: var(--danger);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.detail-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 14px;
}
.detail-lbl {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.detail-val {
  font-size: 13.5px;
  font-weight: 600;
}
.detail-sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
}

.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 1100px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 10px;
}
</style>
