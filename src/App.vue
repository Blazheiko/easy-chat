<script setup lang="ts">
// Главный компонент приложения
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { useStateStore } from '@/stores/state'
// import { useAppInitialization } from '@/composables/useAppInitialization'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import type { User } from '@/stores/user'
import { useContactsStore } from '@/stores/contacts'
import { useMessagesStore } from '@/stores/messages'
import api from '@/utils/api'
import WebsocketBase from '@/utils/websocket-base'
import type { WebsocketMessage } from '@/utils/websocket-base'
import { useEventBus } from '@/utils/event-bus'
import type { ApiMessage } from '@/views/Chat.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(true)
const windowWidth = ref(window.innerWidth)

const stateStore = useStateStore()
const contactsStore = useContactsStore()
const messagesStore = useMessagesStore()
const eventBus = useEventBus()
// const { initializeApp } = useAppInitialization()

// Вычисляем, нужно ли показывать кнопку переключения темы
const showThemeToggle = computed(() => {
    // Скрываем кнопку на странице чата в мобильной версии
    if ((route.name === 'Chat' || route.name === 'UserAccount') && windowWidth.value <= 1400) {
        return false
    }
    return true
})

// Обработчик изменения размера окна
const handleResize = () => {
    windowWidth.value = window.innerWidth
}

// Определяем тему при загрузке приложения
onMounted(async () => {
    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', handleResize)

    // Слушаем изменения предпочтений системы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
            stateStore.setDarkMode(e.matches)
        }
    })

    // Инициализация данных при загрузке приложения
    await initializeApp()

    // Инициализация контактов
    contactsStore.resetContacts()

    // Инициализация сообщений
    messagesStore.resetMessages()

    isLoading.value = false
})

// Удаляем слушатель при размонтировании компонента
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})

const onReauthorize = async () => {
    console.error('onReauthorize')
    api.setWebSocketClient(null)
    await initializeApp()
}

// interface UserOnlineData {
//     userId: number
//     isOnline: boolean
// }

// interface NewMessageData {
//     contactId: number
//     content: string
// }

const eventHandler = {
    user_online: (event: WebsocketMessage) => {
        console.log('user_online')
        console.log(event)
        eventBus.emit('user_online', event.payload as { userId: number; isOnline: boolean })
    },
    new_message: (event: WebsocketMessage) => {
        console.log('new_message')
        console.log(event)
        eventBus.emit('new_message', event.payload as { message: ApiMessage })
    },
}
const onBroadcast = async (data: WebsocketMessage) => {
    console.log('onBroadcast')
    console.log(data)
    const event = data.event.split(':')[1]
    if (event in eventHandler) {
        eventHandler[event as keyof typeof eventHandler](data)
    } else {
        console.error('Unknown event:', event)
    }
}

const initializeApp = async () => {
    try {
        const { data, error } = await api.http('GET', '/api/init')
        console.log(data)

        if (error) {
            console.error('Error in initialization:', error)
            return null
        } else if (data && data.status === 'ok' && data.user && data.wsUrl) {
            userStore.setUser(data.user as User)
            if (route.name !== 'JoinChat') router.push({ name: 'Chat' })

            console.log('Data in initialization:')

            const websocketBase = new WebsocketBase(data.wsUrl as string, {
                callbacks: { onReauthorize, onBroadcast },
            })
            api.setWebSocketClient(websocketBase)
        } else if (data && data.status === 'unauthorized') {
            userStore.setUser(null as unknown as User)
            router.push({ name: 'Login' })
        }
    } catch (error) {
        console.error('Error in initialization:', error)
    }
}

// Переключение темы
const toggleTheme = () => {
    stateStore.setDarkMode(!stateStore.darkMode)
}
</script>

<template>
    <div class="app-container">
        <div v-if="isLoading" class="loader-container">
            <div class="loader"></div>
            <p>Loading...</p>
        </div>
        <template v-else>
            <div v-if="showThemeToggle" class="theme-toggle">
                <button @click="toggleTheme">
                    {{ stateStore.darkMode ? '☀️' : '🌙' }}
                </button>
            </div>
            <router-view />
        </template>
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

/* Изменение позиции кнопки темы на мобильных устройствах */
@media (max-width: 1400px) {
    .theme-toggle {
        top: auto;
        bottom: 20px;
        right: 20px;
    }
}

.loader-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--background-color);
    z-index: 9999;
}

.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    margin-bottom: 16px;
}

.loader-container p {
    color: var(--text-color);
    font-size: 18px;
    font-weight: 500;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
