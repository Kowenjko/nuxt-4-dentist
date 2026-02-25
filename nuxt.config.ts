// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/image', '@pinia/nuxt', '@nuxt/fonts'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  imports: { dirs: ['composables/**'] },
  pinia: { storesDirs: ['./app/store/**'] },
  fonts: {
    families: [{ name: 'DM Sans', provider: 'google' }],
    defaults: {
      weights: [400, 600, 700],
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
