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
  startTime: string
  endTime: string
}
