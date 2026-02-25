export interface UserI {
  id: string
  email: string
  googleId?: string
  password?: string
  name: string
  phone?: string
  avatar?: string

  role: RoleT
  createdAt: string

  doctorProfile: DoctorProfileI
  appointments: AppointmentI[]
}

export interface UserResponseI {
  token: string
  user: UserI
}
