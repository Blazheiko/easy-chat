<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MenuButton from '@/components/MenuButton.vue'

interface Message {
    text: string
    time: string
    isSent: boolean
    status?: 'sent' | 'delivered' | 'read'
    date?: string
}

// Тип звонка
type CallType = 'video' | 'audio' | null

const messages = ref<Message[]>([
    { text: 'Hi! How are you?', time: '10:30 AM', isSent: false, date: 'Today' },
    { text: "Hello! I'm fine, thanks!", time: '10:31 AM', isSent: true, status: 'read' },
    {
        text: 'Would you like to grab lunch tomorrow?',
        time: '3:45 PM',
        isSent: false,
        date: 'Yesterday',
    },
    { text: 'Sure, that sounds great!', time: '3:47 PM', isSent: true, status: 'read' },
    { text: "Let's meet at the usual place?", time: '3:47 PM', isSent: true, status: 'delivered' },
    { text: 'Perfect, see you then!', time: '3:50 PM', isSent: false },
])

const newMessage = ref('')
const isTyping = ref(false)
const messageContainerRef = ref(null)

// Добавляем состояние для управления модальным окном и типом звонка
const isCallActive = ref(false)
const activeCallType = ref<CallType>(null)
const callDuration = ref(0)
const callTimer = ref<number | null>(null)
const isMuted = ref(false)

// Ссылки на видеоэлементы
const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)
const localStream = ref<MediaStream | null>(null)

const sendMessage = () => {
    if (newMessage.value.trim()) {
        messages.value.push({
            text: newMessage.value,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            status: 'sent',
        })
        newMessage.value = ''

        // Прокрутка вниз после отправки сообщения
        setTimeout(scrollToBottom, 100)
    }
}

// Функция прокрутки чата вниз
const scrollToBottom = () => {
    if (messageContainerRef.value) {
        const container = messageContainerRef.value as HTMLElement
        container.scrollTop = container.scrollHeight
    }
}

// Демонстрационная функция для имитации печатания
const simulateTyping = () => {
    isTyping.value = true
    setTimeout(() => {
        isTyping.value = false
        // Имитация получения сообщения после печатания
        setTimeout(() => {
            receiveRandomMessage()
        }, 1000)
    }, 3000)
}

const randomMessages = [
    "Sure, I'll be there!",
    "That's interesting, tell me more.",
    'I agree with you.',
    'Let me think about it.',
    'Can we discuss this later?',
    'Great idea!',
    "I'm not sure about that.",
    'Absolutely!',
]

const receiveRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length)
    messages.value.push({
        text: randomMessages[randomIndex],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: false,
    })

    // Прокрутка вниз после получения сообщения
    setTimeout(scrollToBottom, 100)
}

// Функция для начала видеозвонка
const startVideoCall = async () => {
    activeCallType.value = 'video'
    isCallActive.value = true
    startCallTimer()

    try {
        // Запрашиваем доступ к камере
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })

        localStream.value = stream

        // После рендеринга компонентов подключаем видеопоток
        setTimeout(() => {
            if (localVideoRef.value) {
                localVideoRef.value.srcObject = stream
            }

            // Имитация подключения собеседника (в реальном приложении здесь будет WebRTC логика)
            if (remoteVideoRef.value) {
                // В демонстрационных целях показываем ту же камеру для удаленного пользователя
                remoteVideoRef.value.srcObject = stream
            }
        }, 100)
    } catch (error) {
        console.error('Ошибка при доступе к камере:', error)
    }
}

// Функция для начала аудиозвонка
const startAudioCall = () => {
    activeCallType.value = 'audio'
    isCallActive.value = true
    startCallTimer()
}

// Функция для завершения звонка
const endCall = () => {
    isCallActive.value = false
    activeCallType.value = null
    stopCallTimer()
    callDuration.value = 0

    // Останавливаем и очищаем видеопоток
    if (localStream.value) {
        localStream.value.getTracks().forEach((track) => track.stop())
        localStream.value = null
    }
}

// Запуск таймера звонка
const startCallTimer = () => {
    callDuration.value = 0
    callTimer.value = window.setInterval(() => {
        callDuration.value++
    }, 1000)
}

// Остановка таймера звонка
const stopCallTimer = () => {
    if (callTimer.value) {
        clearInterval(callTimer.value)
        callTimer.value = null
    }
}

// Форматирование времени звонка
const formatCallDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Функция включения/выключения микрофона
const toggleMute = () => {
    if (localStream.value) {
        // Получаем все аудио треки из потока
        const audioTracks = localStream.value.getAudioTracks()

        // Меняем состояние всех аудио треков
        audioTracks.forEach((track) => {
            track.enabled = !track.enabled
        })

        // Обновляем состояние в интерфейсе
        isMuted.value = !isMuted.value
    }
}

onMounted(() => {
    // Прокрутка к последнему сообщению при загрузке
    setTimeout(scrollToBottom, 100)
})

// Очистка ресурсов при размонтировании компонента
onUnmounted(() => {
    // Останавливаем таймер
    stopCallTimer()

    // Останавливаем видеопоток
    if (localStream.value) {
        localStream.value.getTracks().forEach((track) => track.stop())
    }
})
</script>

<template>
    <div class="chat-area">
        <div class="chat-header">
            <button class="toggle-contacts" @click="$emit('toggle-contacts')">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
            <h2>John Smith</h2>

            <div class="header-buttons">
                <!-- <button class="news-button" @click="goToNews">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                    >
                        <path
                            d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h14v-6H5v6zm2-4h10v2H7v-2z"
                        />
                    </svg>
                    <span>News</span>
                </button> -->
                <MenuButton />
            </div>
        </div>

        <div class="messages-container">
            <div class="messages" ref="messageContainerRef">
                <template v-for="(message, index) in messages" :key="index">
                    <div v-if="message.date" class="date-divider">
                        <span>{{ message.date }}</span>
                    </div>
                    <div :class="['message', message.isSent ? 'sent' : 'received']">
                        {{ message.text }}
                        <div class="message-footer">
                            <span>{{ message.time }}</span>
                            <span
                                v-if="message.isSent"
                                class="message-status"
                                :class="message.status"
                            >
                                <svg
                                    v-if="message.status === 'read'"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 7L9.429 15.571L6 12.143"
                                        stroke="currentColor"
                                        fill="none"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M18 7L9.429 15.571L6 12.143"
                                        stroke="currentColor"
                                        fill="none"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        transform="translate(4 0)"
                                    />
                                </svg>
                                <svg
                                    v-else-if="message.status === 'delivered'"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 7L9.429 15.571L6 12.143"
                                        stroke="currentColor"
                                        fill="none"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div class="typing-indicator" v-if="isTyping">
            <span>John is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>

        <div class="input-area">
            <button class="video-call-button" title="Start video call" @click="startVideoCall">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path
                        d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                    />
                </svg>
            </button>
            <button class="voice-call-button" title="Start voice call" @click="startAudioCall">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path
                        d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                    />
                </svg>
            </button>
            <input
                v-model="newMessage"
                type="text"
                class="message-input"
                placeholder="Type a message..."
                @keyup.enter="sendMessage"
                @focus="simulateTyping"
            />
            <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim()">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                </svg>
            </button>
        </div>

        <!-- Модальное окно для звонка -->
        <div class="call-modal" v-if="isCallActive">
            <div class="call-modal-content">
                <div class="call-header">
                    <h3>{{ activeCallType === 'video' ? 'Video Call' : 'Voice Call' }}</h3>
                    <span class="call-duration">{{ formatCallDuration(callDuration) }}</span>
                </div>

                <div class="call-body">
                    <div class="user-avatar" v-if="activeCallType === 'audio'">
                        <div class="avatar-circle">JS</div>
                        <div class="call-status">John Smith</div>
                    </div>

                    <div class="video-container" v-if="activeCallType === 'video'">
                        <div class="remote-video">
                            <video
                                ref="remoteVideoRef"
                                autoplay
                                playsinline
                                class="video-player remote"
                            ></video>
                            <div class="avatar-circle large" v-if="!remoteVideoRef?.srcObject">
                                JS
                            </div>
                            <div class="call-status">John Smith</div>
                        </div>
                        <div class="local-video">
                            <video
                                ref="localVideoRef"
                                autoplay
                                playsinline
                                muted
                                class="video-player local"
                            ></video>
                            <div class="avatar-circle small" v-if="!localVideoRef?.srcObject">
                                ME
                            </div>
                        </div>
                    </div>
                </div>

                <div class="call-actions">
                    <button
                        class="action-button mute"
                        @click="toggleMute"
                        :class="{ active: isMuted }"
                    >
                        <svg
                            v-if="!isMuted"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                                fill="currentColor"
                            />
                            <path
                                d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                                fill="currentColor"
                            />
                        </svg>
                        <svg
                            v-else
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <button class="action-button end-call" @click="endCall">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <button class="action-button speaker" v-if="activeCallType === 'audio'">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <button class="action-button camera" v-if="activeCallType === 'video'">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-area {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    background-color: var(--background-color);
}

.chat-header {
    background-color: var(--primary-color);
    color: white;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    width: 100%;
    flex-shrink: 0;
    box-shadow: var(--box-shadow);
}

.chat-header h2 {
    padding-left: 40px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    font-weight: 600;
    font-size: 18px;
    color: white;
}

.header-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.news-button {
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    padding: 8px 15px;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
}

.news-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    transform: translateY(-1px);
}

.news-button:active {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(0);
}

.messages-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    background-color: var(--background-color);
}

.messages {
    flex: 1;
    padding: 20px;
    padding-bottom: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    background-color: var(--background-color);
}

.dark-theme .messages {
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.messages::-webkit-scrollbar {
    width: 5px;
}

.messages::-webkit-scrollbar-track {
    background: transparent;
}

.messages::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.date-divider {
    text-align: center;
    margin: 20px 0;
    position: relative;
    width: 100%;
}

.date-divider::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.08);
    z-index: 1;
}

.dark-theme .date-divider::before {
    background-color: rgba(255, 255, 255, 0.08);
}

.date-divider span {
    background-color: var(--background-color);
    padding: 0 12px;
    color: #6c757d;
    font-size: 13px;
    position: relative;
    z-index: 2;
    font-weight: 500;
}

.dark-theme .date-divider span {
    color: #adb5bd;
}

.message {
    margin-bottom: 15px;
    padding: 12px 16px;
    border-radius: 18px;
    max-width: 70%;
    position: relative;
    word-wrap: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    line-height: 1.5;
    font-size: 15px;
}

.message.sent {
    background-color: var(--primary-color);
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
}

.dark-theme .message.sent {
    background-color: #0d47a1;
    color: white;
}

.message.received {
    background-color: white;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    color: var(--text-color);
}

.dark-theme .message.received {
    background-color: #2a2a2a;
    color: #e0e0e0;
}

.message-footer {
    font-size: 12px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.message.received .message-footer {
    justify-content: flex-start;
    color: #adb5bd;
}

.message.sent .message-footer {
    justify-content: flex-end;
    color: rgba(255, 255, 255, 0.9);
}

.dark-theme .message.sent .message-footer {
    color: rgba(255, 255, 255, 0.9);
}

.message-status {
    display: inline-flex;
    align-items: center;
}

.message-status svg {
    width: 16px;
    height: 16px;
}

.message.sent .message-status.delivered svg {
    fill: rgba(255, 255, 255, 0.8);
}

.message.sent .message-status.read svg {
    fill: #a3ffcd;
}

.dark-theme .message.sent .message-status.read svg {
    fill: #a3ffcd;
}

.typing-indicator {
    padding: 10px 20px;
    color: #6c757d;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
    width: 100%;
    background-color: var(--background-color);
    animation: fadeIn 0.3s ease;
}

.dark-theme .typing-indicator {
    color: #adb5bd;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.typing-dots {
    display: flex;
    gap: 4px;
}

.typing-dot {
    width: 8px;
    height: 8px;
    background-color: #adb5bd;
    border-radius: 50%;
    animation: typingAnimation 1.4s infinite;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes typingAnimation {
    0%,
    100% {
        opacity: 0.3;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1);
    }
}

.input-area {
    padding: 16px 20px;
    background-color: white;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
    display: flex;
    gap: 12px;
    width: 100%;
    flex-shrink: 0;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

.dark-theme .input-area {
    background-color: #1e1e1e;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
}

.video-call-button,
.voice-call-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 2px 5px rgba(26, 115, 232, 0.2);
}

.video-call-button:hover,
.voice-call-button:hover {
    background-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
}

.video-call-button:active,
.voice-call-button:active {
    background-color: var(--accent-color);
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(26, 115, 232, 0.2);
}

.video-call-button svg,
.voice-call-button svg {
    width: 20px;
    height: 20px;
}

.message-input {
    flex-grow: 1;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 24px;
    outline: none;
    width: 100%;
    max-width: calc(100% - 110px);
    font-size: 15px;
    transition: all 0.2s ease;
    background-color: white;
    color: var(--text-color);
}

.dark-theme .message-input {
    background-color: #333;
    color: #e0e0e0;
    border-color: #444;
}

.message-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.dark-theme .message-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(100, 181, 246, 0.2);
}

.send-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 2px 5px rgba(26, 115, 232, 0.2);
}

.send-button:hover {
    background-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
}

.send-button:active {
    background-color: var(--accent-color);
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(26, 115, 232, 0.2);
}

.send-button:disabled {
    background-color: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.toggle-contacts {
    display: none;
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
    color: white;
}

.toggle-contacts svg {
    width: 24px;
    height: 24px;
}

.toggle-contacts:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    .chat-area {
        height: 100%;
        width: 100%;
    }

    .chat-header {
        padding: 14px;
    }

    .chat-header h2 {
        padding-left: 10px;
        font-size: 16px;
    }

    .message {
        max-width: 85%;
        font-size: 14px;
        padding: 10px 14px;
    }

    .input-area {
        padding: 12px;
    }

    .message-input {
        padding: 10px 12px;
        font-size: 14px;
        max-width: calc(100% - 100px);
    }

    .send-button,
    .video-call-button,
    .voice-call-button {
        width: 38px;
        height: 38px;
    }

    .video-call-button svg,
    .voice-call-button svg,
    .send-button svg {
        width: 18px;
        height: 18px;
    }

    .toggle-contacts {
        display: block;
    }

    .news-button span {
        display: none;
    }

    .news-button {
        padding: 8px;
        justify-content: center;
    }

    .messages::-webkit-scrollbar {
        display: none;
    }

    .messages {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .date-divider span {
        font-size: 12px;
    }

    .message-footer {
        font-size: 11px;
    }
}

/* Стили для модального окна звонка */
.call-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
}

.call-modal-content {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    width: 100%;
    max-width: 1400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.call-header {
    background-color: var(--primary-color);
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.call-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.call-duration {
    font-size: 16px;
    font-family: monospace;
}

.call-body {
    padding: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 300px;
}

.user-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.avatar-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    font-weight: bold;
}

.avatar-circle.large {
    width: 220px;
    height: 220px;
    font-size: 70px;
}

.avatar-circle.small {
    width: 80px;
    height: 80px;
    font-size: 24px;
}

.call-status {
    font-size: 18px;
    font-weight: 500;
    color: var(--text-color);
}

.video-container {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
}

.remote-video {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    position: relative;
}

.remote-video .avatar-circle.large {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.local-video {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 5px;
    z-index: 2;
}

.local-video .avatar-circle.small {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.call-actions {
    padding: 15px;
    display: flex;
    justify-content: center;
    gap: 20px;
    background-color: rgba(0, 0, 0, 0.05);
    margin-top: 10px;
}

.dark-theme .call-actions {
    background-color: rgba(255, 255, 255, 0.05);
}

.action-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: rgba(0, 0, 0, 0.1);
    color: var(--text-color);
}

.dark-theme .action-button {
    background-color: rgba(255, 255, 255, 0.1);
}

.action-button svg {
    width: 24px;
    height: 24px;
}

.action-button:hover {
    transform: translateY(-2px);
    background-color: rgba(0, 0, 0, 0.2);
}

.dark-theme .action-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.action-button.end-call {
    background-color: #e74c3c;
    color: white;
}

.action-button.end-call:hover {
    background-color: #c0392b;
}

.action-button.active {
    background-color: #f44336;
    color: white;
}

.mute,
.speaker,
.camera {
    background-color: var(--primary-color);
    color: white;
}

.mute.active {
    background-color: #f44336;
}

.mute:hover,
.speaker:hover,
.camera:hover {
    background-color: var(--accent-color);
}

.mute.active:hover {
    background-color: #d32f2f;
}

@media (max-width: 768px) {
    .call-modal-content {
        max-width: 100%;
        height: 100%;
        border-radius: 0;
    }

    .call-body {
        min-height: auto;
        flex: 1;
    }

    .avatar-circle {
        width: 100px;
        height: 100px;
        font-size: 36px;
    }

    .avatar-circle.large {
        width: 140px;
        height: 140px;
        font-size: 50px;
    }

    .action-button {
        width: 45px;
        height: 45px;
    }

    .video-player.remote {
        height: 300px;
    }

    .video-player.local {
        width: 90px;
        height: 70px;
    }
}

.video-player {
    border-radius: 10px;
    background-color: #000;
    object-fit: cover;
}

.video-player.remote {
    width: 100%;
    height: 600px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.video-player.local {
    width: 120px;
    height: 90px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.remote-video {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    position: relative;
}

.remote-video .avatar-circle.large {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.local-video {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 5px;
    z-index: 2;
}

.local-video .avatar-circle.small {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}
</style>
