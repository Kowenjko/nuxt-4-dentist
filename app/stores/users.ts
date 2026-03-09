import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', () => {
  const user = ref<UserI | null>(null)
  const myBooking = ref<MyAppointment | null>(null)

  const dateBooking = computed(() => {
    if (!myBooking.value) return null

    const [date, time] = myBooking.value.startTime.split('T')

    if (!date || !time) return null
    const [startH, startM] = time.split(':').map(Number)

    if (!startH) return null
    return { date: fmtDate(date), time: `${startH + 2}:${startM}` }
  })

  return { user, myBooking, dateBooking }
})
