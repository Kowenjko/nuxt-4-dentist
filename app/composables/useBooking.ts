// composables/useBooking.ts
// ─────────────────────────────────────────────────────────────────────
// Повний composable для системи онлайн-запису пацієнтів
// Підтримує: запис, перегляд своїх записів, скасування
// ─────────────────────────────────────────────────────────────────────

// ── Module-level singletons ────────────────────────────────────────────
// Modal
const isOpen = ref(false)
const step = ref<BookingStep>('doctor')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')

// Selections
const selDoctor = ref<BookingDoctor | null>(null)
const selService = ref<BookingService | null>(null)
const selDate = ref('')
const selSlot = ref<TimeSlot | null>(null)
const notes = ref('')
const bookedId = ref('')

// Data
const allDoctors = ref<BookingDoctor[]>([])
const slots = ref<TimeSlot[]>([])
const lunchBreak = ref<{ start: string; end: string } | null>(null)

// Calendar
const _today = new Date()
_today.setHours(0, 0, 0, 0)
const calYear = ref(_today.getFullYear())
const calMonth = ref(_today.getMonth())

// My appointments panel
const apptPanelOpen = ref(false)
const myAppointments = ref<MyAppointment[]>([])
const apptLoading = ref(false)
const cancellingId = ref<string | null>(null)

// ── Composable ────────────────────────────────────────────────────────

export const useBooking = () => {
  const usersStore = useUsersStore()

  // ── Calendar ───────────────────────────────────────────────────────

  const calTitle = computed(() =>
    new Date(calYear.value, calMonth.value, 1).toLocaleDateString('uk-UA', {
      month: 'long',
      year: 'numeric',
    })
  )

  const calDays = computed(() => {
    const first = new Date(calYear.value, calMonth.value, 1)
    const last = new Date(calYear.value, calMonth.value + 1, 0)

    const workingDows: number[] | null = selDoctor.value?.doctorSchedule
      ? selDoctor.value.doctorSchedule.filter((s) => s.isWorking).map((s) => s.weekday)
      : null

    const cells: { date: string; day: number; disabled: boolean; isToday: boolean }[] = []

    // Monday-first leading blanks: (dow + 6) % 7
    const lead = (first.getDay() + 6) % 7
    for (let i = 0; i < lead; i++) cells.push({ date: '', day: 0, disabled: true, isToday: false })

    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(calYear.value, calMonth.value, d)
      // НЕ використовуємо toISOString() — вона конвертує в UTC і при UTC+2/+3
      // дата зсувається на попередній день (напр. 12 берез. → "2026-03-11")
      const y = dt.getFullYear()
      const mo = String(dt.getMonth() + 1).padStart(2, '0')
      const dy = String(dt.getDate()).padStart(2, '0')
      const iso = `${y}-${mo}-${dy}`
      const dow = dt.getDay()
      cells.push({
        date: iso,
        day: d,
        disabled: dt < _today || (workingDows ? !workingDows.includes(dow) : dow === 0),
        isToday: dt.getTime() === _today.getTime(),
      })
    }
    return cells
  })

  const prevMonth = () => {
    if (calMonth.value === 0) {
      calMonth.value = 11
      calYear.value--
    } else calMonth.value--
  }
  const nextMonth = () => {
    if (calMonth.value === 11) {
      calMonth.value = 0
      calYear.value++
    } else calMonth.value++
  }

  // ── Slot grouping ──────────────────────────────────────────────────

  const morningSlots = computed(() => slots.value.filter((s) => s.period === 'morning'))
  const afternoonSlots = computed(() => slots.value.filter((s) => s.period === 'afternoon'))
  const eveningSlots = computed(() => slots.value.filter((s) => s.period === 'evening'))

  const slotPeriod = (time: string): TimeSlot['period'] => {
    const h = parseInt(time.split(':')[0])
    if (h < 13) return 'morning'
    if (h < 18) return 'afternoon'
    return 'evening'
  }

  // ── API: Load doctors ──────────────────────────────────────────────

  const loadDoctors = async () => {
    if (allDoctors.value.length) return
    loading.value = true
    error.value = ''
    try {
      allDoctors.value = await $fetch<BookingDoctor[]>('/api/doctors')
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Не вдалось завантажити список лікарів'
    } finally {
      loading.value = false
    }
  }

  // ── API: Load time slots ───────────────────────────────────────────

  const loadSlots = async () => {
    if (!selDoctor.value || !selDate.value) return
    loading.value = true
    slots.value = []
    error.value = ''
    try {
      // API повертає { meta, slots }
      const res = await $fetch<{
        meta: {
          date: string
          workStart: string
          workEnd: string
          lunchBreak: { start: string; end: string } | null
        }
        slots: TimeSlot[]
      }>(`/api/doctors/${selDoctor.value.id}/slots`, {
        params: { date: selDate.value, serviceId: selService.value?.id },
      })
      slots.value = res.slots
      lunchBreak.value = res.meta.lunchBreak
    } catch {
      // Fallback: generate from doctor's schedule
      const dow = new Date(`${selDate.value}T12:00:00`).getDay()
      const sched = selDoctor.value.doctorSchedule?.find((s) => s.weekday === dow)
      const dur = selService.value?.duration ?? 30
      slots.value = _genSlots(
        selDate.value,
        sched?.startTime ?? '09:00',
        sched?.endTime ?? '18:00',
        dur
      )
    } finally {
      loading.value = false
    }
  }

  const _genSlots = (date: string, start: string, end: string, dur: number): TimeSlot[] => {
    const result: TimeSlot[] = []
    let [h, m] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const endMin = eh * 60 + em
    while (h * 60 + m + dur <= endMin) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      result.push({
        time,
        datetime: `${date}T${time}:00`,
        available: Math.random() > 0.3,
        period: slotPeriod(time),
      })
      m += dur
      if (m >= 60) {
        h += Math.floor(m / 60)
        m %= 60
      }
    }
    return result
  }

  // ── API: Submit booking ────────────────────────────────────────────

  const submitBooking = async () => {
    if (!selDoctor.value || !selService.value || !selSlot.value) return
    submitting.value = true
    error.value = ''
    try {
      const token = useCookie('auth_token').value
      const res = await $fetch<MyAppointment>('/api/appointments', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: {
          doctorId: selDoctor.value.id,
          serviceId: selService.value.id,
          startTime: selSlot.value.datetime,
          notes: notes.value || undefined,
        },
      })
      bookedId.value = res.id
      step.value = 'success'
      usersStore.myBooking = res
      // Refresh appointments list if open
      if (apptPanelOpen.value) await loadMyAppointments()
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Помилка збереження. Спробуйте знову.'
    } finally {
      submitting.value = false
    }
  }

  // ── API: My appointments ───────────────────────────────────────────

  const loadMyAppointments = async () => {
    apptLoading.value = true
    try {
      const token = useCookie('auth_token').value
      const res = await $fetch<{ data: MyAppointment[] }>('/api/appointments/my', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      myAppointments.value = res.data || []
    } catch {
      // fallback: try generic endpoint
      try {
        const res = await $fetch<{ data: MyAppointment[] }>('/api/appointments?limit=20')
        myAppointments.value = res.data || []
      } catch {
        myAppointments.value = []
      }
    } finally {
      apptLoading.value = false
    }
  }

  const cancelAppointment = async (id: string) => {
    cancellingId.value = id
    try {
      const token = useCookie('auth_token').value
      await $fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { status: 'CANCELLED' },
      })
      const appt = myAppointments.value.find((a) => a.id === id)
      if (appt) appt.status = 'CANCELLED'
    } catch (e: any) {
      // silent — UI shows old status
    } finally {
      cancellingId.value = null
    }
  }

  const openApptPanel = async () => {
    apptPanelOpen.value = true
    await loadMyAppointments()
  }
  const closeApptPanel = () => {
    apptPanelOpen.value = false
  }

  // ── Flow ───────────────────────────────────────────────────────────

  const open = (opts?: {
    doctor?: BookingDoctor
    service?: BookingService
    date?: string
    slot?: TimeSlot
  }) => {
    console.log(opts)
    _reset()
    if (opts?.doctor) {
      selDoctor.value = opts.doctor
    }
    if (opts?.service) {
      selService.value = opts.service
    }
    if (opts?.date) {
      selDate.value = opts.date
    }
    if (opts?.date) {
      selSlot.value = opts.slot
    }

    if (opts?.doctor && opts?.service && opts?.date && opts?.slot) step.value = 'confirm'
    else if (opts?.doctor && opts?.service && opts?.date) pickDate(opts?.date)
    else if (opts?.doctor && opts?.service) step.value = 'date'
    else if (opts?.doctor) step.value = 'service'
    else {
      step.value = 'doctor'
      loadDoctors()
    }

    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const _reset = () => {
    step.value = 'doctor'
    selDoctor.value = null
    selService.value = null
    selDate.value = ''
    selSlot.value = null
    notes.value = ''
    bookedId.value = ''
    error.value = ''
    slots.value = []
    lunchBreak.value = null
    calYear.value = _today.getFullYear()
    calMonth.value = _today.getMonth()
  }

  const pickDoctor = (d: BookingDoctor) => {
    selDoctor.value = d
    selService.value = null
    error.value = ''
    step.value = 'service'
  }

  const pickService = (s: BookingService) => {
    selService.value = s
    error.value = ''
    step.value = 'date'
  }

  const pickDate = async (date: string) => {
    selDate.value = date
    selSlot.value = null
    error.value = ''
    await loadSlots()
    step.value = 'time'
  }

  const pickSlot = (sl: TimeSlot) => {
    if (!sl.available) return
    selSlot.value = sl
    error.value = ''
    step.value = 'confirm'
  }

  const goBack = () => {
    const MAP: Partial<Record<BookingStep, BookingStep>> = {
      service: 'doctor',
      date: 'service',
      time: 'date',
      confirm: 'time',
    }
    const prev = MAP[step.value]
    if (prev) {
      step.value = prev
      error.value = ''
    }
  }

  // ── Meta ───────────────────────────────────────────────────────────

  const STEPS: BookingStep[] = ['doctor', 'service', 'date', 'time', 'confirm']
  const stepIndex = computed(() => STEPS.indexOf(step.value))

  const STEP_LABELS: Record<BookingStep, string> = {
    doctor: 'Лікар',
    service: 'Послуга',
    date: 'Дата',
    time: 'Час',
    confirm: 'Підтвердження',
    success: 'Готово',
  }

  const statusLabel = (s: MyAppointment['status']) =>
    ({
      PENDING: 'Очікує',
      CONFIRMED: 'Підтверджено',
      CANCELLED: 'Скасовано',
      COMPLETED: 'Завершено',
    })[s] ?? s

  const statusColor = (s: MyAppointment['status']) =>
    ({
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      CANCELLED: 'status-cancelled',
      COMPLETED: 'status-done',
    })[s] ?? ''

  const canCancel = (a: MyAppointment) =>
    ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.startTime) > new Date()

  return {
    // modal state
    isOpen,
    step,
    loading,
    submitting,
    error,
    // selections
    selDoctor,
    selService,
    selDate,
    selSlot,
    notes,
    bookedId,
    // data
    allDoctors,
    slots,
    morningSlots,
    afternoonSlots,
    eveningSlots,
    lunchBreak,
    // calendar
    calYear,
    calMonth,
    calDays,
    calTitle,
    prevMonth,
    nextMonth,
    // appointments panel
    apptPanelOpen,
    myAppointments,
    apptLoading,
    cancellingId,
    // actions
    open,
    close,
    pickDoctor,
    pickService,
    pickDate,
    pickSlot,
    goBack,
    submitBooking,
    openApptPanel,
    closeApptPanel,
    cancelAppointment,
    loadMyAppointments,
    // helpers
    // fmtPrice,
    // fmtDate,
    // fmtDateShort,
    // fmtDateTime,
    statusLabel,
    statusColor,
    canCancel,
    // meta
    stepIndex,
    STEPS,
    STEP_LABELS,
  }
}
