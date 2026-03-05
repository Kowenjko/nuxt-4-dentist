export const serviceAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<ServiceI[]>(API + SERVICES)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(API + SERVICES + `/${id}`)
  },

  async create(body: ServiceI) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(API + SERVICES, { method: 'POST', body })
  },

  async update(id: string, body: ServiceI) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(API + SERVICES + `/${id}`, { method: 'PUT', body })
  },

  async delete(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DeleteResponseI>(API + SERVICES + `/${id}`, { method: 'DELETE' })
  },
}
