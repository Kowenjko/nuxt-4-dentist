export interface CreateAppointmentI {
  doctorId: string
  serviceId: string
  startTime: string
  notes: string | undefined
}
export interface UpdateAppointmentI {
  startTime?: string // Начало приема (хранить в UTC!)
  endTime?: string // Конец приема
  status?: AppointmentStatus
  notes?: string
  clientId?: string
  doctorId?: string
  serviceId?: string
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
  data: MyAppointment[]
  pagination: PaginationI
  counts: AppointmentCountsI
  meta: AppointmentMateI
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

export type BookingStep = 'doctor' | 'service' | 'date' | 'time' | 'confirm' | 'success'
