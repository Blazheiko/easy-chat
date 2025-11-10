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
import baseApi from '@/utils/base-api'
import WebsocketBase from '@/utils/websocket-base'
import type { WebsocketMessage } from '@/utils/websocket-base'
import { useEventBus } from '@/utils/event-bus'
import type { ApiMessage } from '@/views/Chat.vue'
import AppHeader from '@/components/AppHeader.vue'
import IncomingCallModal from '@/components/IncomingCallModal.vue'
import { useWebRTC } from '@/composables/useWebRTC'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(true)
// const windowWidth = ref(window.innerWidth)

const stateStore = useStateStore()
const contactsStore = useContactsStore()
const messagesStore = useMessagesStore()
const eventBus = useEventBus()
const { acceptCall, handleAnswer, handleIceCandidate, endCall } = useWebRTC()
// const { initializeApp } = useAppInitialization()

const windowWidth = stateStore.windowWidth

// Обработчики WebRTC событий
const handleWebRTCIceCandidate = (data: { candidate: RTCIceCandidateInit }) => {
    // Отправляем ICE candidate через WebSocket
    baseApi.ws('main/webrtc_ice_candidate', data)
}

const handleWebRTCCallAnswer = (data: { answer: RTCSessionDescriptionInit }) => {
    // Отправляем answer через WebSocket
    baseApi.ws('main/webrtc_call_answer', data)
}

// Вычисляем, нужно ли показывать кнопку переключения темы
const showThemeToggle = computed(() => {
    // Скрываем кнопку на странице чата в мобильной версии
    if ((route.name === 'Chat' || route.name === 'UserAccount') && windowWidth <= 1400) {
        return false
    }
    return true
})

// Пропсы для глобального хедера из meta маршрута
const headerTitle = computed(() => (route.meta.title as string) || '')
const headerBackPath = computed(() => (route.meta.backPath as string) || '')
const headerBackLabel = computed(() => (route.meta.backLabel as string) || 'Back')

// Обработчик изменения размера окна
// const handleResize = () => {
//     windowWidth.value = window.innerWidth
// }

// Определяем тему при загрузке приложения
onMounted(async () => {
    // Добавляем слушатель изменения размера окна
    // window.addEventListener('resize', handleResize)

    // Слушаем изменения предпочтений системы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        stateStore.setDarkMode(e.matches)
        // if (localStorage.getItem('theme') === null) {
        //     stateStore.setDarkMode(e.matches)
        // }
    })

    // Инициализация данных при загрузке приложения

    // Инициализация контактов
    contactsStore.resetContacts()

    // Инициализация сообщений
    messagesStore.resetMessages()

    await initializeApp()
    isLoading.value = false
    eventBus.on('init_app', initializeApp)
    eventBus.on('unauthorized', onReauthorize)

    // Отслеживаем изменения состояния WebRTC
    eventBus.on('webrtc_ice_candidate', handleWebRTCIceCandidate)
    eventBus.on('webrtc_call_answer', handleWebRTCCallAnswer)
})

// Удаляем слушатель при размонтировании компонента
onBeforeUnmount(() => {
    // window.removeEventListener('resize', handleResize)
    eventBus.off('init_app', initializeApp)
    eventBus.off('unauthorized', onReauthorize)
    eventBus.off('webrtc_ice_candidate', handleWebRTCIceCandidate)
    eventBus.off('webrtc_call_answer', handleWebRTCCallAnswer)
})

const onReauthorize = async () => {
    console.error('onReauthorize')
    websocketBase?.destroy()
    baseApi.setWebSocketClient(null)
    userStore.clearUser()
    router.push('/')
    // setTimeout(async () => {
    //     await initializeApp()
    // }, 1000)
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
        eventBus.emit('user_online', event.payload as { userId: number; isOnline: boolean })
    },
    new_message: (event: WebsocketMessage) => {
        console.log('new_message')
        eventBus.emit('new_message', event.payload as { message: ApiMessage })
    },
    event_typing: (event: WebsocketMessage) => {
        console.log('event_typing')
        eventBus.emit('event_typing', event.payload as { userId: number; contactId: number })
    },
    change_online: (event: WebsocketMessage) => {
        console.log('change_online', event.payload)
        contactsStore.updateContactById(String(event.payload.userId), {
            isOnline: event.payload.status === 'online',
        })
        // eventBus.emit('change_online', event.payload as { userId: number; status: string })
    },
    incoming_call: (event: WebsocketMessage) => {
        console.log('incoming_call', event.payload)
        const payload = event.payload as {
            callerId: string | number
            callerName: string
            callType: 'video' | 'audio'
        }

        // Находим контакт в списке для получения имени
        const contact = contactsStore.getContactById(String(payload.callerId))

        stateStore.setIncomingCall({
            callerId: payload.callerId,
            callerName: contact?.name || payload.callerName || 'Unknown',
            callType: payload.callType || 'audio',
        })
    },
    accept_call: (event: WebsocketMessage) => {
        console.log('accept_call', event.payload)
        stateStore.clearIncomingCall()
    },
    decline_call: (event: WebsocketMessage) => {
        console.log('decline_call', event.payload)
        stateStore.clearIncomingCall()
    },
    webrtc_call_offer: async (event: WebsocketMessage) => {
        console.log('webrtc_call_offer', event.payload)
        const payload = event.payload as {
            offer: RTCSessionDescriptionInit
            callType: 'video' | 'audio'
            callerId: string | number
        }

        // Если звонок уже принят и мы ожидаем offer
        if (
            stateStore.incomingCall.isConnecting &&
            payload.offer &&
            stateStore.incomingCall.callType
        ) {
            try {
                // Принимаем звонок с полученным offer
                const success = await acceptCall(stateStore.incomingCall.callType, payload.offer)
                if (success) {
                    stateStore.setCallConnected()
                    console.log('WebRTC call established successfully')
                } else {
                    stateStore.setCallError('Failed to establish WebRTC connection')
                }
            } catch (error) {
                console.error('Error processing WebRTC offer:', error)
                stateStore.setCallError('Error processing call offer')
            }
        }
    },
    webrtc_call_answer: (event: WebsocketMessage) => {
        console.log('webrtc_call_answer', event.payload)
        const payload = event.payload as { answer: RTCSessionDescriptionInit }
        if (payload.answer) {
            handleAnswer(payload.answer)
        }
    },
    webrtc_ice_candidate: (event: WebsocketMessage) => {
        console.log('webrtc_ice_candidate', event.payload)
        const payload = event.payload as { candidate: RTCIceCandidateInit }
        if (payload.candidate) {
            handleIceCandidate(payload.candidate)
        }
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

let websocketBase: WebsocketBase | null = null

const initializeApp = async () => {
    try {
        const { data, error } = await baseApi.http('GET', '/api/main/init')
        console.log(data)

        if (error) {
            console.error('Error in initialization:', error)
            return null
        } else if (data && data.status === 'ok' && data.user && data.wsUrl) {
            userStore.setUser(data.user as User)
            if (route.name !== 'JoinChat') router.push({ name: 'Chat' })

            console.log('Data in initialization:')

            websocketBase = new WebsocketBase(data.wsUrl as string, {
                callbacks: { onReauthorize, onBroadcast },
            })
            baseApi.setWebSocketClient(websocketBase)
        } else if (data && data.status === 'unauthorized' && route.name !== 'JoinChat') {
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

// Обработка входящего звонка
const handleAcceptCall = async () => {
    console.log('Call accepted:', stateStore.incomingCall)

    if (!stateStore.incomingCall.callerId || !stateStore.incomingCall.callType) {
        console.error('Invalid call data')
        return
    }

    try {
        // Устанавливаем состояние "подключение"
        stateStore.setCallConnecting()

        // Отправляем WebSocket сообщение о принятии звонка
        baseApi.ws('main/accept_call', {
            callerId: stateStore.incomingCall.callerId,
            callType: stateStore.incomingCall.callType,
            callerName: stateStore.incomingCall.callerName,
        })

        // Здесь должен быть получен offer от вызывающей стороны через WebSocket
        // Пока что имитируем получение offer (в реальном приложении это будет приходить через WebSocket)
        // const mockOffer: RTCSessionDescriptionInit = {
        //     type: 'offer',
        //     sdp: 'mock-sdp-data'
        // }

        // Инициализируем WebRTC соединение для принятия звонка
        // В реальном приложении offer будет получен через WebSocket событие
        console.log('WebRTC call acceptance initiated, waiting for offer...')
    } catch (error) {
        console.error('Failed to accept call:', error)
        stateStore.setCallError('Failed to accept call')
        // Через некоторое время очищаем состояние при ошибке
        setTimeout(() => {
            stateStore.clearIncomingCall()
        }, 3000)
    }
}

const handleDeclineCall = () => {
    console.log('Call declined:', stateStore.incomingCall)
    // Отправляем WebSocket сообщение об отклонении звонка
    if (stateStore.incomingCall.callerId) {
        baseApi.ws('main/decline_call', {
            callerId: stateStore.incomingCall.callerId,
            callerName: stateStore.incomingCall.callerName,
            callType: stateStore.incomingCall.callType,
        })
    }
    stateStore.clearIncomingCall()
}

const handleCancelConnection = () => {
    console.log('Connection cancelled:', stateStore.incomingCall)

    // Завершаем WebRTC соединение если оно было инициализировано
    endCall()

    // Отправляем WebSocket сообщение об отмене соединения
    if (stateStore.incomingCall.callerId) {
        baseApi.ws('main/cancel_call', {
            callerId: stateStore.incomingCall.callerId,
            callerName: stateStore.incomingCall.callerName,
            callType: stateStore.incomingCall.callType,
        })
    }

    // Очищаем состояние звонка
    stateStore.clearIncomingCall()
}
</script>

<template>
    <div class="app-container">
        <div v-if="isLoading" class="loader-container">
            <div class="loader"></div>
            <p>Loading...</p>
        </div>
        <template v-else>
            <AppHeader
                v-if="userStore.user"
                :title="headerTitle"
                :back-path="headerBackPath"
                :back-label="headerBackLabel"
            />
            <div v-if="showThemeToggle" class="theme-toggle">
                <button @click="toggleTheme">
                    {{ stateStore.darkMode ? '☀️' : '🌙' }}
                </button>
            </div>
            <router-view />
        </template>

        <!-- Глобальное модальное окно для входящих звонков -->
        <IncomingCallModal
            v-if="stateStore.incomingCall.isActive"
            :caller-name="stateStore.incomingCall.callerName"
            :caller-id="stateStore.incomingCall.callerId!"
            :call-type="stateStore.incomingCall.callType!"
            :is-connecting="stateStore.incomingCall.isConnecting"
            :is-connected="stateStore.incomingCall.isConnected"
            :error="stateStore.incomingCall.error"
            @accept-call="handleAcceptCall"
            @decline-call="handleDeclineCall"
            @cancel-connection="handleCancelConnection"
        />
    </div>
</template>

<style>
:root {
    --primary-color: #145fc2;
    --accent-color: #195cc6;
    --background-color: #f8f9fa;
    --text-color: #212529;
    --border-color: #dee2e6;
    --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    --border-radius: 8px;
    --content-max-width: 800px;
    --header-height: 36px;
    /* Цвета индикаторов: календарь и задачи */
    --calendar-color: #ff3b30; /* оттенок красного, как в календаре */
    --task-color: #4caf50; /* зеленый как в task manager */
}

:root.dark-theme {
    --primary-color: #0d47a1;
    --accent-color: #0d47a1;
    --background-color: #121212;
    --text-color: #e0e0e0;
    --border-color: #424242;
    --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    --calendar-color: #ff6b6b;
    --task-color: #66bb6a;
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
        --header-height: 32px;
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
