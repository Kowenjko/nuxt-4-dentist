export const doctorAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI[]>(API + DOCTORS)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI>(API + DOCTORS + `/${id}`)
  },

  async update(id: string, body: DoctorProfileI) {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI>(API + DOCTORS + +`/${id}`, { method: 'PUT', body })
  },

  async getSchedule(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorScheduleI>(API + DOCTORS + +`/${id}` + SCHEDULE)
  },

  async createSchedule(id: string, body: DoctorScheduleI) {
    const { $api } = useNuxtApp()
    return await $api<CreateScheduleI>(API + DOCTORS + +`/${id}` + SCHEDULE, {
      method: 'POST',
      body,
    })
  },

  async getSlots(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorSlotsI>(API + DOCTORS + +`/${id}` + SLOTS)
  },
}
