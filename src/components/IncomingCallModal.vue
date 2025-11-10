<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
    callerName: string
    callerId: string | number
    callType: 'video' | 'audio'
}

defineProps<Props>()

const emit = defineEmits<{
    'accept-call': []
    'decline-call': []
}>()

// Звук входящего звонка
const ringtoneAudio = ref<HTMLAudioElement | null>(null)
const audioError = ref<string | null>(null)
const isAudioPlaying = ref(false)

// Функция для попытки воспроизведения звука
const tryPlayRingtone = async () => {
    if (!ringtoneAudio.value) return

    try {
        // Устанавливаем громкость
        ringtoneAudio.value.volume = 0.7

        // Пытаемся воспроизвести
        await ringtoneAudio.value.play()
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
            await tryFallbackSound()
        }
    }
}

// Функция для попытки воспроизведения fallback звука
const tryFallbackSound = async () => {
    try {
        const fallbackAudio = new Audio('/audio/notification_1.mp3')
        fallbackAudio.volume = 0.5
        fallbackAudio.loop = true
        await fallbackAudio.play()

        // Заменяем основной аудио на fallback
        if (ringtoneAudio.value) {
            ringtoneAudio.value.pause()
        }
        ringtoneAudio.value = fallbackAudio
        isAudioPlaying.value = true
        console.log('Fallback sound started playing')
    } catch (fallbackError) {
        console.error('Failed to play fallback sound:', fallbackError)
        audioError.value = 'Unable to play any ringtone sound'
    }
}

// Функция для остановки звука
const stopRingtone = () => {
    if (ringtoneAudio.value && isAudioPlaying.value) {
        ringtoneAudio.value.pause()
        ringtoneAudio.value.currentTime = 0
        isAudioPlaying.value = false
    }
}

onMounted(async () => {
    await nextTick()

    // Создаем аудио элемент
    ringtoneAudio.value = new Audio('/audio/pdjyznja.mp3')
    ringtoneAudio.value.loop = true
    ringtoneAudio.value.preload = 'auto'

    // Добавляем обработчики событий
    ringtoneAudio.value.addEventListener('loadeddata', () => {
        console.log('Ringtone audio loaded successfully')
    })

    ringtoneAudio.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e)
        audioError.value = 'Failed to load audio file'
    })

    ringtoneAudio.value.addEventListener('canplaythrough', () => {
        console.log('Audio can play through')
        // Пытаемся воспроизвести после загрузки
        tryPlayRingtone()
    })

    // Если аудио уже готово к воспроизведению
    if (ringtoneAudio.value.readyState >= 3) {
        tryPlayRingtone()
    }
})

onUnmounted(() => {
    stopRingtone()
    if (ringtoneAudio.value) {
        ringtoneAudio.value.removeEventListener('loadeddata', () => {})
        ringtoneAudio.value.removeEventListener('error', () => {})
        ringtoneAudio.value.removeEventListener('canplaythrough', () => {})
        ringtoneAudio.value = null
    }
})

const handleAccept = () => {
    stopRingtone()
    emit('accept-call')
}

const handleDecline = () => {
    stopRingtone()
    emit('decline-call')
}

// Функция для ручного запуска звука (если автовоспроизведение заблокировано)
const manualPlayRingtone = () => {
    if (!isAudioPlaying.value) {
        tryPlayRingtone()
    }
}
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
                    Incoming {{ callType === 'video' ? 'video' : 'voice' }} call...
                </p>

                <!-- Показываем статус аудио и кнопку для ручного воспроизведения -->
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

            <div class="call-actions">
                <button class="call-button decline" @click="handleDecline" title="Decline call">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
                            fill="currentColor"
                        />
                    </svg>
                    <span>Decline</span>
                </button>

                <button class="call-button accept" @click="handleAccept" title="Accept call">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                            fill="currentColor"
                        />
                    </svg>
                    <span>Accept</span>
                </button>
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

.call-button:active {
    transform: translateY(0);
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
