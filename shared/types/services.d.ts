// export type AppointmentStatusT = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface ServiceI {
  id: string
  name: string // Например: "Лечение кариеса"
  duration: number // Длительность в минутах (например, 60)
  price: number // @db.Decimal(10,2)
  doctors: DoctorProfileI[] // Врачи, которые оказывают эту услугу
  appointments: AppointmentI[]
}

export interface CreateAppointmentI {
  doctorId: string
  serviceId: string
  startTime: string
  notes: string
}

export interface AppointmentI {
  id: string
  startTime: string // Начало приема (хранить в UTC!)
  endTime: string // Конец приема
  status: AppointmentStatus // PENDING, CONFIRMED, CANCELLED, COMPLETED
  notes?: string
  clientId: string
  client: UserI
  doctorId: string
  doctor: DoctorProfileI
  serviceId: string
  service: ServiceI
  createdAt: string
  updatedAt: string
}

export interface AppointmentCountsI {
  all: string
  upcoming: string
  past: string
  pending: string
  confirmed: string
  cancelled: string
  completed: string
}

export interface AppointmentCancelI {
  ids?: string[]
  period?: Period
}
export interface CancelResponseI {
  cancelled: number
  ids: string[]
  message: string
}
export interface AppointmentMetaI {
  userId: string
  role: Role
  period: string
  sort: 'asc' | 'desc'
}

export interface AppointmentMyI {
  data: AppointmentI
  pagination: PaginationI
  counts: AppointmentCountsI
  meta: AppointmentMateI
}
