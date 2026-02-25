// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['@nuxt/image', '@pinia/nuxt'],
	components: [
		{
			path: '~/components',
			pathPrefix: false,
		},
	],
	pinia: {
		storesDirs: ['./stores/**'],
	},
	runtimeConfig: {
		public: {},
		jwtSecret: process.env.JWT_SECRET,
	},
})
