// export type AppointmentStatusT = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface ServiceI {
  id?: string
  name: string // Например: "Лечение кариеса"
  duration: number // Длительность в минутах (например, 60)
  price: number // @db.Decimal(10,2)
  doctors?: DoctorProfileI[] // Врачи, которые оказывают эту услугу
  appointments?: AppointmentI[]
  _count?: { appointments: number }
}
