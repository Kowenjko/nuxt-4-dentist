export interface DoctorProfileI {
  id: string
  userId: string
  user: UserI
  bio?: string
  services: ServiceI[]
  specialty: string
  doctorSchedule: DoctorScheduleI[]
  appointments: AppointmentI[]
}

export interface DoctorScheduleI {
  id: string
  doctorId: string
  doctor: DoctorProfileI
  weekday: number // 0 - Воскресенье, 1 - Понедельник, ..., 6 - Суббота
  startTime: string // "09:00"
  endTime: string // "18:00"
  isWorking: boolean // Выходной или рабочий день
}

export interface CreateScheduleI {
  count: number
}

export interface DoctorSlotsI {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar: string | null
}

export interface TimeSlotClientI {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar: string | null
}

export interface TimeSlot {
  time: string // "09:00"
  datetime: string // "2026-03-10T09:00:00"
  available: boolean
  period: 'morning' | 'afternoon' | 'evening'
  bookedBy: TimeSlotClientI | null // null якщо вільний
}
