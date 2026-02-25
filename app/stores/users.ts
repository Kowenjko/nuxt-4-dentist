import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', () => {
  const user = ref<UserI | null>(null)

  return { user }
})
