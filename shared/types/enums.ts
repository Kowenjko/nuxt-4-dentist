export const Roles = {
  CLIENT: 'CLIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const

export type Role = (typeof Roles)[keyof typeof Roles]
