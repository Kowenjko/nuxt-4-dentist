// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/main.css', '~/assets/css/admin-pages.css', '~/assets/css/responsive.css'],
  modules: ['@nuxt/image', '@pinia/nuxt', '@nuxt/fonts', '@vueuse/nuxt'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  imports: { dirs: ['composables/**'] },
  pinia: { storesDirs: ['./stores/**'] },
  fonts: {
    families: [
      { name: 'DM Sans', provider: 'google' },
      { name: 'JetBrains Mono', provider: 'google' },
      { name: 'Syne', provider: 'google' },
      { name: 'Outfit', provider: 'google' },
      { name: 'DM Serif Display', provider: 'google' },
      { name: 'Georgia', provider: 'google' },
    ],
    defaults: {
      weights: [300, 400, 500, 600, 700],
      subsets: ['latin', 'cyrillic'],
    },
  },
  runtimeConfig: {
    public: { baseURL: process.env.APP_URL },
    jwtSecret: process.env.JWT_SECRET,
    appBaseUrl: process.env.APP_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
})