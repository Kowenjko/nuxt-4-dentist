// export type AppointmentStatusT = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface ServiceI {
  id: string
  name: string // Например: "Лечение кариеса"
  duration: number // Длительность в минутах (например, 60)
  price: number // @db.Decimal(10,2)
  doctors: DoctorProfileI[] // Врачи, которые оказывают эту услугу
  appointments: AppointmentI[]
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
