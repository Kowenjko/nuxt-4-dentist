export interface UserI {
  id?: string
  email: string
  googleId?: string
  password?: string
  name: string
  phone?: string
  avatar?: string

  role: Role
  createdAt?: string

  doctorProfile?: DoctorProfileI
  appointments?: AppointmentI[]

  specialty?: string
}

export interface UserResponseI {
  token: string
  user: UserI
}
