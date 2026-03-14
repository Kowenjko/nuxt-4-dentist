export const doctorAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<BookingDoctor[]>(DOCTORS)
  },
  async get(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI>(DOCTORS + `/${id}`)
  },

  async update(id: string, body: DoctorUpdateI) {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI>(DOCTORS + `/${id}`, { method: 'PUT', body })
  },

  async getSchedule(id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorScheduleI>(DOCTORS + `/${id}` + SCHEDULE)
  },

  async createSchedule(id: string, body: CreateScheduleI) {
    const { $api } = useNuxtApp()
    return await $api<DoctorScheduleI[]>(DOCTORS + `/${id}` + SCHEDULE, {
      method: 'POST',
      body,
    })
  },

  async getSlots(id: string, params: any) {
    const { $api } = useNuxtApp()
    return await $api<DoctorSlotsI>(DOCTORS + `/${id}` + SLOTS, { params })
  },
}
