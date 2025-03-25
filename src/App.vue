<script setup lang="ts">
// Главный компонент приложения
import { onMounted } from 'vue'
import { useStateStore } from '@/stores/state'
import { useAppInitialization } from '@/composables/useAppInitialization'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import type { User } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const stateStore = useStateStore()
const { initializeApp } = useAppInitialization()

// Определяем тему при загрузке приложения
onMounted(async () => {
    // Слушаем изменения предпочтений системы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
            stateStore.setDarkMode(e.matches)
        }
    })

    // Инициализация данных при загрузке приложения
    const result = await initializeApp()
    if (result?.user) {
        userStore.setUser(result.user as User)
        router.push({ name: 'News' })
        console.log('Data in initialization:')
    }
})

// Переключение темы
function toggleTheme() {
    stateStore.setDarkMode(!stateStore.darkMode)
}
</script>

<template>
    <div class="app-container">
        <div class="theme-toggle">
            <button @click="toggleTheme">
                {{ stateStore.darkMode ? '☀️' : '🌙' }}
            </button>
        </div>
        <router-view />
    </div>
</template>

<style>
:root {
    --primary-color: #1a73e8;
    --accent-color: #4285f4;
    --background-color: #f8f9fa;
    --text-color: #212529;
    --border-color: #dee2e6;
    --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    --border-radius: 8px;
    --content-max-width: 800px;
    --header-height: 60px;
}

:root.dark-theme {
    --primary-color: #0d47a1;
    --accent-color: #0d47a1;
    --background-color: #121212;
    --text-color: #e0e0e0;
    --border-color: #424242;
    --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

body {
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol';
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    font-size: 16px;
}

#app {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

button {
    font-family: inherit;
}

a {
    color: var(--primary-color);
    text-decoration: none;
}

h1,
h2,
h3,
h4,
h5,
h6 {
    font-weight: 600;
    line-height: 1.3;
}

img,
svg {
    max-width: 100%;
    height: auto;
}

textarea,
input {
    font-family: inherit;
    font-size: inherit;
}

/* Глобальные утилитарные классы */
.container {
    width: 100%;
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 0 20px;
}

@media (max-width: 768px) {
    :root {
        --content-max-width: 100%;
        --header-height: 56px;
    }

    body {
        font-size: 15px;
    }

    .container {
        padding: 0 16px;
    }

    h1 {
        font-size: 24px;
    }

    h2 {
        font-size: 20px;
    }

    h3 {
        font-size: 18px;
    }
}

.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999;
}

.theme-toggle button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    padding: 8px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dark-theme .theme-toggle button {
    background-color: rgba(255, 255, 255, 0.1);
}

.theme-toggle button:hover {
    background-color: rgba(0, 0, 0, 0.2);
}

.dark-theme .theme-toggle button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}
</style>
