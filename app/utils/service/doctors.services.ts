export const doctorAPI = {
  async getAll() {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI[]>(API + DOCTORS)
  },
  async get(doctor_id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI>(API + DOCTORS + `/${doctor_id}`)
  },

  async update(doctor_id: string, body: DoctorProfileI) {
    const { $api } = useNuxtApp()
    return await $api<DoctorProfileI>(API + DOCTORS + +`/${doctor_id}`, { method: 'POST', body })
  },

  async getSchedule(doctor_id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorScheduleI>(API + DOCTORS + +`/${doctor_id}` + SCHEDULE)
  },

  async createSchedule(doctor_id: string, body: DoctorScheduleI) {
    const { $api } = useNuxtApp()
    return await $api<CreateScheduleI>(API + DOCTORS + +`/${doctor_id}` + SCHEDULE, {
      method: 'POST',
      body,
    })
  },

  async getSlots(doctor_id: string) {
    const { $api } = useNuxtApp()
    return await $api<DoctorSlotsI>(API + DOCTORS + +`/${doctor_id}` + SLOTS)
  },
}
