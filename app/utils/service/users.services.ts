export const userAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<ApiResponseI<UserI[]>>(USERS)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<UserI>(USERS + `/${id}`)
  },

  async update(id: string, body: UserI) {
    const { $api } = useNuxtApp()
    return await $api<ServiceI>(USERS + `/${id}`, { method: 'PUT', body })
  },

  async delete(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DeleteResponseI>(USERS + `/${id}`, { method: 'DELETE' })
  },
}
