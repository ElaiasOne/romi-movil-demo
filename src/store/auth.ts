import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuth = defineStore('auth', () => {
  const user = ref<{ username: string } | null>(null)

  // restaura sesión
  const raw = localStorage.getItem('romi_user')
  if (raw) {
    try { user.value = JSON.parse(raw) } catch {}
  }

  const isLogged = computed(() => !!user.value)

  function login(username: string, password: string) {
    if (username === 'admin' && password === 'admin') {
      user.value = { username }
      localStorage.setItem('romi_user', JSON.stringify(user.value))
      return true
    }
    return false
  }
  function logout() {
    user.value = null
    localStorage.removeItem('romi_user')
  }

  return { user, isLogged, login, logout }
})
