export const Periods = {
  ALL: 'all',
  PAST: 'past',
  UPCOMING: 'upcoming',
} as const

export const TimeSlotPeriods = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
} as const

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

export type Period = (typeof Periods)[keyof typeof Periods]
export type Role = (typeof Roles)[keyof typeof Roles]
export type AppointmentStatus = (typeof Status)[keyof typeof Status]
