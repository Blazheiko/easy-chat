import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', () => {
    const theme = localStorage.getItem('theme')
    const darkMode = ref(theme === 'dark')
    // const isLoading = ref(false)
    // const isOffline = ref(false)
    // const isMenuOpen = ref(false)
    const windowWidth = ref(window.innerWidth)
    const isPWAMode = ref(false)
    // const doubleCount = computed(() => count.value * 2)

    const handleResize = () => {
        windowWidth.value = window.innerWidth
    }

    // Функция для определения режима PWA
    const checkPWAMode = () => {
        // Проверяем display-mode через CSS media query
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        // Дополнительная проверка для iOS Safari
        const isIOSStandalone =
            'standalone' in window.navigator &&
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        // Проверяем User Agent для Android
        const isAndroidApp = window.matchMedia('(display-mode: minimal-ui)').matches

        isPWAMode.value = isStandalone || isIOSStandalone || isAndroidApp
        return isPWAMode.value
    }

    // Инициализируем проверку PWA режима
    checkPWAMode()

    // Отслеживаем изменения display-mode
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)')
    const minimalUIMediaQuery = window.matchMedia('(display-mode: minimal-ui)')

    standaloneMediaQuery.addEventListener('change', checkPWAMode)
    minimalUIMediaQuery.addEventListener('change', checkPWAMode)

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

    return {
        darkMode,
        setDarkMode,
        windowWidth,
        isPWAMode,
        checkPWAMode,
    }
})
