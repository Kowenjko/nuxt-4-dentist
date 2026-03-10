export const appointmentAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<ApiResponseI<AppointmentI[]>>(APPOINTMENTS)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<AppointmentI>(APPOINTMENTS + `/${id}`)
  },

  async create(body: CreateAppointmentI) {
    const { $api } = useNuxtApp()
    return await $api<AppointmentI>(APPOINTMENTS, { method: 'POST', body })
  },

  async update(id: string, body: AppointmentI) {
    const { $api } = useNuxtApp()
    return await $api<AppointmentI>(APPOINTMENTS + `/${id}`, { method: 'PUT', body })
  },

  async delete(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DeleteResponseI>(APPOINTMENTS + `/${id}`, { method: 'DELETE' })
  },

  async my() {
    const { $api } = useNuxtApp()
    return await $api<AppointmentMyI>(APPOINTMENTS + MY)
  },

  async cancel(body: AppointmentCancelI) {
    const { $api } = useNuxtApp()
    return await $api<CancelResponseI>(APPOINTMENTS + MY, { method: 'DELETE', body })
  },
}
