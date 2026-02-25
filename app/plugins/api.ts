import { defineNuxtPlugin } from '#app'
import { useErrorsStore } from '@/stores/errors'
import { toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  const { baseURL } = useRuntimeConfig().public

  const api = $fetch.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },

    onRequest({ options }) {
      const token = useCookie('auth_token')
      if (token) options.headers.set('Authorization', `Bearer ${token}`)
    },

    async onResponseError({ response }) {
      if (process.client) {
        const errorsStore = useErrorsStore()
        const message = response?._data?.statusMessage || 'Сталася помилка. Спробуйте ще раз.'
        errorsStore.setErrors(message)

        toast.error(message)
      }
      if (response.status === 401) await nuxtApp.runWithContext(() => navigateTo('/'))
      throw response._data
    },
  })

  return {
    provide: { api },
  }
})
