export const authAPI = {
  async login(body: LoginI) {
    const { $api } = useNuxtApp()
    return await $api<UserResponseI>(API + AUTH + LOGIN, { method: 'POST', body })
  },

  async logout() {
    const { $api } = useNuxtApp()
    return await $api<UserResponseI>(API + AUTH + LOGOUT, { method: 'POST' })
  },

  async register(body: RegisterI) {
    const { $api } = useNuxtApp()
    return await $api<UserResponseI>(API + AUTH + REGISTER, { method: 'POST', body })
  },

  async me() {
    const { $api } = useNuxtApp()
    return await $api<UserI>(API + AUTH + ME, { credentials: 'include' })
  },
}
