export const authAPI = {
  async login(body: LoginI) {
    const { $api } = useNuxtApp()
    return await $api<UserResponseI>(AUTH + LOGIN, { method: 'POST', body })
  },

  async logout() {
    const { $api } = useNuxtApp()
    return await $api<UserResponseI>(AUTH + LOGOUT, { method: 'POST' })
  },

  async register(body: RegisterI) {
    const { $api } = useNuxtApp()
    return await $api<UserResponseI>(AUTH + REGISTER, { method: 'POST', body })
  },

  async me() {
    const { $api } = useNuxtApp()
    return await $api<UserI>(AUTH + ME, { credentials: 'include' })
  },
}
