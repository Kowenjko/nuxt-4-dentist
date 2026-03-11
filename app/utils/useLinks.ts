import type { RouteLocationRaw } from 'vue-router'

// client-page
export const LOGIN_LINK = {
  name: 'login',
} as const satisfies RouteLocationRaw

export const REGISTER_LINK = {
  name: 'register',
} as const satisfies RouteLocationRaw

export const GOOGLE_CALLBACK_LINK = {
  name: 'auth-callback',
} as const satisfies RouteLocationRaw

export const HOME_LINK = {
  name: 'index',
} as const satisfies RouteLocationRaw

// admin-page
export const ADMIN_LINK = {
  name: 'admin',
} as const satisfies RouteLocationRaw

export const ADMIN_APPOINTMENTS_LINK = {
  name: 'admin-appointments',
} as const satisfies RouteLocationRaw

export const ADMIN_DOCTORS_LINK = {
  name: 'admin-doctors',
} as const satisfies RouteLocationRaw

export const ADMIN_SERVICES_LINK = {
  name: 'admin-services',
} as const satisfies RouteLocationRaw

export const ADMIN_USERS_LINK = {
  name: 'admin-users',
} as const satisfies RouteLocationRaw
