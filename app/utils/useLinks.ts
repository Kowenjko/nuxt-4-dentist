import type { RouteLocationRaw } from 'vue-router'

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
