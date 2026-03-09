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
  lunchStart?: string // "13:00" — null якщо перерви немає
  lunchEnd?: string // "14:00" — null якщо перерви немає
  isWorking: boolean // Выходной или рабочий день
}

export interface CreateScheduleI {
  schedule: Omit<DoctorScheduleI, 'id' | 'doctorId' | 'doctor'>[]
}

export interface BookingDoctor {
  id: string
  specialty: string
  bio?: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  services?: BookingService[]
  doctorSchedule?: ScheduleDay[]
  _count?: { appointments: number }
}

export interface ScheduleDay {
  weekday: number // 0 Sun … 6 Sat
  isWorking: boolean
  startTime: string // "09:00"
  endTime: string // "18:00"
}

export interface BookingService {
  id: string
  name: string
  duration: number
  price: number | string
}

export interface TimeSlotClient {
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
  period: TimeSlotPeriod
  bookedBy: TimeSlotClient | null // null якщо вільний
}
export interface MetaSlot {
  date: string
  workStart: string
  workEnd: string
  lunchBreak: { start: string; end: string }
}

export interface MyAppointment {
  id: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes?: string
  doctor: {
    id: string
    specialty: string
    user: { name: string; email: string; avatar?: string }
  }
  service: { id: string; name: string; duration: number; price: number }
}

export interface DoctorSlotsI {
  slots: TimeSlot[]
  meta: MetaSlot
}
