export type RoleT = 'CLIENT' | 'DOCTOR' | 'ADMIN'

export interface LoginI {
  email: string
  password: string
}
export interface RegisterI {
  email: string
  password: string
  name: string
  phone?: string
  role?: RoleT
}
