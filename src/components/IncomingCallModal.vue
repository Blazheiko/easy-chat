<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Props {
    callerName: string
    callerId: string | number
    callType: 'video' | 'audio'
    isConnecting?: boolean
    isConnected?: boolean
    error?: string | null
    localStream?: MediaStream | null
    remoteStream?: MediaStream | null
    isOutgoing?: boolean // Новый prop для определения типа звонка
    callState?: {
        isConnecting: boolean
        isConnected: boolean
        isLocalVideoEnabled: boolean
        isLocalAudioEnabled: boolean
        isRemoteVideoEnabled: boolean
        isRemoteAudioEnabled: boolean
        error: string | null
    }
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'accept-call': []
    'decline-call': []
    'cancel-connection': []
}>()

// Звук входящего звонка - НЕ реактивный для лучшей производительности
let ringtoneAudio: HTMLAudioElement | null = null
const audioError = ref<string | null>(null)
const isAudioPlaying = ref(false)
const isAudioStopped = ref(false) // Флаг для предотвращения повторного запуска

// Refs для видео элементов
const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)

// Функция для попытки воспроизведения звука
const tryPlayRingtone = async () => {
    console.log(
        'tryPlayRingtone called, audio exists:',
        !!ringtoneAudio,
        'isAudioStopped:',
        isAudioStopped.value,
    )

    // Не запускаем звук если он был остановлен пользователем
    if (!ringtoneAudio || isAudioStopped.value) {
        console.log('Skipping ringtone play - audio stopped or not available')
        return
    }

    // Не запускаем если уже играет
    if (isAudioPlaying.value) {
        console.log('Ringtone already playing, skipping')
        return
    }

    try {
        // Устанавливаем громкость
        ringtoneAudio.volume = 0.7

        // Пытаемся воспроизвести
        await ringtoneAudio.play()
        isAudioPlaying.value = true
        audioError.value = null
        console.log('Ringtone started playing successfully')
    } catch (error: unknown) {
        console.error('Failed to play ringtone:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown audio error'
        audioError.value = errorMessage

        // Если автовоспроизведение заблокировано, попробуем fallback звук
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
            console.log('Autoplay blocked, trying fallback sound...')
            // await tryFallbackSound()
        }
    }
}

// Функция для попытки воспроизведения fallback звука (отключена)
// const tryFallbackSound = async () => {
//     try {
//         const fallbackAudio = new Audio('/audio/notification_1.mp3')
//         fallbackAudio.volume = 0.5
//         fallbackAudio.loop = true
//         await fallbackAudio.play()

//         // Заменяем основной аудио на fallback
//         if (ringtoneAudio) {
//             ringtoneAudio.pause()
//         }
//         ringtoneAudio = fallbackAudio
//         isAudioPlaying.value = true
//         console.log('Fallback sound started playing')
//     } catch (fallbackError) {
//         console.error('Failed to play fallback sound:', fallbackError)
//         audioError.value = 'Unable to play any ringtone sound'
//     }
// }

// Функция для остановки звука
const stopRingtone = () => {
    console.log('stopRingtone called, current state:', {
        hasAudio: !!ringtoneAudio,
        isPlaying: isAudioPlaying.value,
        isStopped: isAudioStopped.value,
    })

    // Устанавливаем флаг остановки
    isAudioStopped.value = true

    if (ringtoneAudio) {
        try {
            ringtoneAudio.pause()
            ringtoneAudio.currentTime = 0
            isAudioPlaying.value = false
            console.log('Ringtone stopped successfully')
        } catch (error) {
            console.error('Error stopping ringtone:', error)
            isAudioPlaying.value = false
        }
    } else {
        isAudioPlaying.value = false
    }
}

onMounted(async () => {
    await nextTick()

    // Создаем аудио элемент только для входящих звонков
    if (!props.isOutgoing) {
        console.log('IncomingCallModal mounted - creating audio element')

        // Создаем аудио элемент
        ringtoneAudio = new Audio('/audio/pdjyznja.mp3')
        ringtoneAudio.loop = true
        ringtoneAudio.preload = 'auto'

        // Добавляем обработчики событий
        ringtoneAudio.addEventListener('loadeddata', () => {
            console.log('Ringtone audio loaded successfully')
        })

        ringtoneAudio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e)
            audioError.value = 'Failed to load audio file'
        })

        ringtoneAudio.addEventListener('canplaythrough', () => {
            console.log('Audio can play through - attempting to play')
            // Пытаемся воспроизвести после загрузки
            tryPlayRingtone()
        })

        // Если аудио уже готово к воспроизведению
        if (ringtoneAudio.readyState >= 3) {
            console.log('Audio already ready - attempting to play immediately')
            tryPlayRingtone()
        }
    }
})

onUnmounted(() => {
    console.log('IncomingCallModal unmounted - cleaning up audio')
    stopRingtone()
    if (ringtoneAudio) {
        ringtoneAudio.removeEventListener('loadeddata', () => {})
        ringtoneAudio.removeEventListener('error', () => {})
        ringtoneAudio.removeEventListener('canplaythrough', () => {})
        ringtoneAudio = null
    }
})

const handleAccept = () => {
    console.log('handleAccept called - stopping ringtone and emitting accept-call')
    stopRingtone()
    emit('accept-call')
}

const handleDecline = () => {
    stopRingtone()
    emit('decline-call')
}

const handleCancelConnection = () => {
    stopRingtone()
    emit('cancel-connection')
}

// Функция для ручного запуска звука (если автовоспроизведение заблокировано)
const manualPlayRingtone = () => {
    console.log('manualPlayRingtone called')
    if (!isAudioPlaying.value) {
        isAudioStopped.value = false // Сбрасываем флаг остановки для ручного запуска
        tryPlayRingtone()
    }
}

// Отслеживаем изменения состояния соединения и останавливаем звук
watch(
    () => [props.isConnecting, props.isConnected, props.error],
    ([isConnecting, isConnected, error]) => {
        // Останавливаем звук при любом изменении состояния соединения
        if (isConnecting || isConnected || error) {
            console.log('Stopping ringtone due to connection state change:', {
                isConnecting,
                isConnected,
                error,
            })
            stopRingtone()
        }
    },
    { immediate: false },
)
</script>

<template>
    <div class="incoming-call-overlay">
        <div class="incoming-call-modal">
            <div class="call-icon-wrapper">
                <div class="call-icon-ring"></div>
                <div class="call-icon">
                    <svg
                        v-if="callType === 'video'"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                        />
                    </svg>
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                        />
                    </svg>
                </div>
            </div>

            <div class="call-info">
                <div class="caller-avatar">
                    {{ callerName.substring(0, 2).toUpperCase() }}
                </div>
                <h2 class="caller-name">{{ callerName }}</h2>
                <p class="call-type-label">
                    <template v-if="props.isConnecting">
                        Connecting {{ callType === 'video' ? 'video' : 'voice' }} call...
                    </template>
                    <template v-else-if="props.isConnected">
                        {{ callType === 'video' ? 'Video' : 'Voice' }} call connected!
                    </template>
                    <template v-else-if="props.error"> Call error: {{ props.error }} </template>
                    <template v-else>
                        {{ props.isOutgoing ? 'Calling' : 'Incoming' }}
                        {{ callType === 'video' ? 'video' : 'voice' }} call...
                    </template>
                </p>

                <!-- Показываем статус аудио только для входящих звонков -->
                <div
                    v-if="
                        !props.isOutgoing &&
                        !props.isConnecting &&
                        !props.isConnected &&
                        !props.error
                    "
                >
                    <div v-if="audioError && !isAudioPlaying" class="audio-status">
                        <p class="audio-error">{{ audioError }}</p>
                        <button
                            class="play-sound-btn"
                            @click="manualPlayRingtone"
                            title="Click to play ringtone"
                        >
                            🔊 Play Ringtone
                        </button>
                    </div>

                    <div v-else-if="isAudioPlaying" class="audio-status">
                        <p class="audio-playing">🔊 Ringtone playing...</p>
                    </div>
                </div>
            </div>

            <!-- Видео элементы для подключенного звонка -->
            <div v-if="props.isConnected && callType === 'video'" class="video-container">
                <div class="remote-video">
                    <video
                        ref="remoteVideoRef"
                        autoplay
                        playsinline
                        class="video-player remote"
                        :srcObject="remoteStream"
                    ></video>
                    <div class="avatar-circle large" v-if="!remoteStream">
                        {{ callerName.substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="call-status">{{ callerName }}</div>
                </div>
                <div class="local-video">
                    <video
                        ref="localVideoRef"
                        autoplay
                        playsinline
                        muted
                        class="video-player local"
                        :srcObject="localStream"
                    ></video>
                    <div class="avatar-circle small" v-if="!localStream">ME</div>
                </div>
            </div>

            <!-- Индикатор состояния соединения -->
            <div v-if="props.isConnecting" class="connection-status connecting">
                <div class="connection-loader"></div>
                <p>Establishing connection...</p>
            </div>

            <div v-else-if="props.isConnected" class="connection-status connected">
                <div class="connection-success">✓</div>
                <p>Call connected successfully!</p>
            </div>

            <div v-else-if="props.error" class="connection-status error">
                <div class="connection-error">⚠</div>
                <p>{{ props.error }}</p>
            </div>

            <div class="call-actions" v-if="!props.isConnected">
                <!-- Показываем кнопку отмены во время установки соединения -->
                <template v-if="props.isConnecting">
                    <button
                        class="call-button cancel"
                        @click="handleCancelConnection"
                        title="Cancel connection"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>Cancel</span>
                    </button>
                </template>

                <!-- Обычные кнопки принять/отклонить или завершить для исходящих -->
                <template v-else>
                    <!-- Для исходящих звонков показываем только кнопку завершения -->
                    <template v-if="props.isOutgoing">
                        <button class="call-button decline" @click="handleDecline" title="End call">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>End Call</span>
                        </button>
                    </template>

                    <!-- Для входящих звонков показываем принять/отклонить -->
                    <template v-else>
                        <button
                            class="call-button decline"
                            @click="handleDecline"
                            title="Decline call"
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>Decline</span>
                        </button>

                        <button
                            class="call-button accept"
                            @click="handleAccept"
                            title="Accept call"
                            :class="{ connecting: props.isConnecting }"
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>Accept</span>
                        </button>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.incoming-call-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
    backdrop-filter: blur(8px);
}

.incoming-call-modal {
    background-color: var(--background-color);
    border-radius: 24px;
    padding: 40px 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    animation: slideUp 0.4s ease;
}

.call-icon-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.call-icon-ring {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 3px solid var(--primary-color);
    animation: pulse 2s infinite;
    opacity: 0.6;
}

.call-icon {
    width: 80px;
    height: 80px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    box-shadow: 0 4px 20px rgba(26, 115, 232, 0.4);
}

.call-icon svg {
    width: 40px;
    height: 40px;
}

.call-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
}

.caller-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.caller-name {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
}

.call-type-label {
    font-size: 16px;
    color: #6c757d;
    margin: 0;
}

.dark-theme .call-type-label {
    color: #adb5bd;
}

.audio-status {
    margin-top: 12px;
    text-align: center;
}

.audio-error {
    font-size: 12px;
    color: #f44336;
    margin: 0 0 8px 0;
}

.audio-playing {
    font-size: 12px;
    color: #4caf50;
    margin: 0;
    animation: pulse 1.5s ease-in-out infinite;
}

.play-sound-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.play-sound-btn:hover {
    background-color: #1976d2;
    transform: translateY(-1px);
}

.play-sound-btn:active {
    transform: translateY(0);
}

.call-actions {
    display: flex;
    gap: 20px;
    width: 100%;
    justify-content: center;
}

.call-button {
    flex: 1;
    max-width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 600;
}

.call-button svg {
    width: 32px;
    height: 32px;
}

.call-button.accept {
    background-color: #4caf50;
    color: white;
    animation: acceptPulse 1.5s ease-in-out infinite;
}

.call-button.accept:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.call-button.decline {
    background-color: #f44336;
    color: white;
}

.call-button.decline:hover {
    background-color: #da190b;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.call-button.cancel {
    background-color: #ff9800;
    color: white;
    max-width: 200px;
    margin: 0 auto;
}

.call-button.cancel:hover {
    background-color: #f57c00;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.call-button:active {
    transform: translateY(0);
}

.call-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.call-button:disabled:hover {
    transform: none !important;
    box-shadow: none !important;
}

/* Состояние соединения */
.connection-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    margin: 16px 0;
    text-align: center;
}

.connection-status.connecting {
    background-color: rgba(33, 150, 243, 0.1);
    border: 2px solid rgba(33, 150, 243, 0.3);
}

.connection-status.connected {
    background-color: rgba(76, 175, 80, 0.1);
    border: 2px solid rgba(76, 175, 80, 0.3);
}

.connection-status.error {
    background-color: rgba(244, 67, 54, 0.1);
    border: 2px solid rgba(244, 67, 54, 0.3);
}

.connection-loader {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(33, 150, 243, 0.3);
    border-top: 3px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.connection-success {
    width: 32px;
    height: 32px;
    background-color: #4caf50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
}

.connection-error {
    width: 32px;
    height: 32px;
    background-color: #f44336;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
}

.connection-status p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
}

.connection-status.connecting p {
    color: #2196f3;
}

.connection-status.connected p {
    color: #4caf50;
}

.connection-status.error p {
    color: #f44336;
}

/* Лоадер в кнопке */
.button-loader {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.call-button.connecting {
    background-color: #2196f3 !important;
    animation: none;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.6;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.3;
    }
    100% {
        transform: scale(1);
        opacity: 0.6;
    }
}

@keyframes acceptPulse {
    0% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
}

/* Стили для видео элементов */
.video-container {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    margin-top: 20px;
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
    width: 120px;
    height: 120px;
    font-size: 40px;
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
    width: 60px;
    height: 60px;
    font-size: 20px;
}

.video-player {
    border-radius: 10px;
    background-color: #000;
    object-fit: cover;
}

.video-player.remote {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.video-player.local {
    width: 80px;
    height: 60px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.call-status {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color);
    margin-top: 10px;
}

@media (max-width: 768px) {
    .incoming-call-modal {
        padding: 32px 24px;
        gap: 24px;
    }

    .caller-avatar {
        width: 70px;
        height: 70px;
        font-size: 24px;
    }

    .caller-name {
        font-size: 20px;
    }

    .call-type-label {
        font-size: 14px;
    }

    .call-icon {
        width: 70px;
        height: 70px;
    }

    .call-icon svg {
        width: 35px;
        height: 35px;
    }

    .call-icon-ring {
        width: 100px;
        height: 100px;
    }

    .call-button {
        max-width: 120px;
        padding: 14px;
        gap: 6px;
        font-size: 13px;
    }

    .call-button svg {
        width: 28px;
        height: 28px;
    }
}
</style>
