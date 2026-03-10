export const serviceAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<ServiceI[]>(SERVICES)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(SERVICES + `/${id}`)
  },

  async create(body: ServiceI) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(SERVICES, { method: 'POST', body })
  },

  async update(id: string, body: ServiceI) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(SERVICES + `/${id}`, { method: 'PUT', body })
  },

  async delete(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DeleteResponseI>(SERVICES + `/${id}`, { method: 'DELETE' })
  },
}
