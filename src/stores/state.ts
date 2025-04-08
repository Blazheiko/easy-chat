import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', () => {
  const theme = localStorage.getItem('theme')
  const darkMode = ref(theme === 'dark')
  // const isLoading = ref(false)
  // const isOffline = ref(false)
  // const isMenuOpen = ref(false)
  const windowWidth = ref(window.innerWidth)
  // const doubleCount = computed(() => count.value * 2)

  const handleResize = () => {
    windowWidth.value = window.innerWidth
}

  window.addEventListener('resize', handleResize)

  // Применение темы
  function applyTheme() {
    if (darkMode.value) {
      document.documentElement.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  // Вызываем сразу для инициализации темы
  applyTheme()

  function setDarkMode(value: boolean) {
    darkMode.value = value
    applyTheme()
  }

  // Отслеживаем изменения темы
  watch(darkMode, applyTheme)

  return { darkMode, setDarkMode, windowWidth }
})
