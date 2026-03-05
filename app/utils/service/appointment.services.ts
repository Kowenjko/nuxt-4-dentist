export const appointmentAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<ApiResponseI<AppointmentI[]>>(API + APPOINTMENTS)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<AppointmentI>(API + APPOINTMENTS + `/${id}`)
  },

  async create(body: CreateAppointmentI) {
    const { $api } = useNuxtApp()
    return await $api<AppointmentI>(API + APPOINTMENTS, { method: 'POST', body })
  },

  async update(id: string, body: AppointmentI) {
    const { $api } = useNuxtApp()
    return await $api<AppointmentI>(API + APPOINTMENTS + `/${id}`, { method: 'PUT', body })
  },

  async delete(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DeleteResponseI>(API + APPOINTMENTS + `/${id}`, { method: 'DELETE' })
  },

  async my() {
    const { $api } = useNuxtApp()
    return await $api<AppointmentMyI>(API + APPOINTMENTS + MY)
  },

  async cancel(body: AppointmentCancelI) {
    const { $api } = useNuxtApp()
    return await $api<CancelResponseI>(API + APPOINTMENTS + MY, { method: 'DELETE', body })
  },
}
