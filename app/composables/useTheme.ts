// composables/useTheme.ts
// ─────────────────────────────────────────────────────────────────────────
// Управління темою: client-light | client-dark | admin-dark | admin-light
// Зберігає вибір у localStorage, застосовує data-theme на <html>
// ─────────────────────────────────────────────────────────────────────────

export type Panel = 'client' | 'admin'
export type ThemeMode = 'light' | 'dark'
export type ThemeName = `${Panel}-${ThemeMode}`

const STORAGE_KEYS: Record<Panel, string> = {
  client: 'clinic-theme-client',
  admin: 'clinic-theme-admin',
}

const DEFAULTS: Record<Panel, ThemeMode> = {
  client: 'light',
  admin: 'dark',
}

// ── Singleton state ────────────────────────────────────────────────────
const clientMode = ref<ThemeMode>('light')
const adminMode = ref<ThemeMode>('dark')
let initialized = false

// ── Composable ─────────────────────────────────────────────────────────
export const useTheme = (panel: Panel = 'client') => {
  // ── Init (read from localStorage once) ──────────────────────────────
  const init = () => {
    if (initialized || !import.meta.client) return
    initialized = true

    const saved_client = localStorage.getItem(STORAGE_KEYS.client) as ThemeMode | null
    const saved_admin = localStorage.getItem(STORAGE_KEYS.admin) as ThemeMode | null

    // Detect OS preference as fallback
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    clientMode.value = saved_client ?? (prefersDark ? 'dark' : 'light')
    adminMode.value = saved_admin ?? 'dark'

    _applyAll()

    // Follow OS changes if no manual override
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEYS.client)) {
        clientMode.value = e.matches ? 'dark' : 'light'
        _applyAll()
      }
    })
  }

  // ── Current mode for this panel ──────────────────────────────────────
  const mode = computed<ThemeMode>(() => (panel === 'client' ? clientMode.value : adminMode.value))

  const isDark = computed(() => mode.value === 'dark')

  const themeName = computed<ThemeName>(() => `${panel}-${mode.value}`)

  // ── Toggle ───────────────────────────────────────────────────────────
  const toggle = () => setMode(panel === 'client' ? clientMode.value : adminMode.value, true)

  const setMode = (current: ThemeMode, isToggle = false) => {
    const next: ThemeMode = isToggle ? (current === 'light' ? 'dark' : 'light') : current

    if (panel === 'client') clientMode.value = next
    else adminMode.value = next

    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS[panel], next)
      _applyAll()
    }
  }

  const setDark = () => setMode('dark')
  const setLight = () => setMode('light')

  // ── Apply theme name to <html> ───────────────────────────────────────
  const _applyAll = () => {
    if (!import.meta.client) return
    const el = document.documentElement

    // Знімаємо всі теми
    el.removeAttribute('data-theme')

    // Застосовуємо активну панель
    // (якщо на admin-сторінці — admin тема, якщо на client — client тема)
    const route = window.location.pathname
    const isAdmin = route.startsWith('/admin')

    const active: ThemeName = isAdmin ? `admin-${adminMode.value}` : `client-${clientMode.value}`

    el.setAttribute('data-theme', active)

    // Також оновлюємо meta theme-color для мобільних браузерів
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      const isDarkMode = active.endsWith('dark')
      metaTheme.setAttribute('content', isDarkMode ? '#0d0f12' : '#faf9f6')
    }
  }

  // ── Apply for specific page (викликається в layouts) ─────────────────
  const applyFor = (p: Panel) => {
    if (!import.meta.client) return
    const mode = p === 'client' ? clientMode.value : adminMode.value
    document.documentElement.setAttribute('data-theme', `${p}-${mode}`)
  }

  // ── SSR-safe: атрибут для <html> у nuxt.config / app.vue ─────────────
  const htmlAttrs = computed(() => ({
    'data-theme': `${panel}-${mode.value}` as ThemeName,
  }))

  return {
    // State
    mode,
    isDark,
    themeName,
    clientMode: readonly(clientMode),
    adminMode: readonly(adminMode),

    // Actions
    toggle,
    setDark,
    setLight,
    init,
    applyFor,

    // For useHead / app.vue
    htmlAttrs,
  }
}
