export const Roles = {
  CLIENT: 'CLIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const

export const Status = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const

export type Role = (typeof Roles)[keyof typeof Roles]
export type AppointmentStatus = (typeof Status)[keyof typeof Status]
