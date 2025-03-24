import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id?: string
  name?: string
  email?: string
  [key: string]: string | number | boolean | undefined
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  function setUser(userData: User) {
    user.value = userData
  }

  function clearUser() {
    user.value = null
  }

  return { user, setUser, clearUser }
})
