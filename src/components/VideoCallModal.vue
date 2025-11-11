<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useWebRTC } from '@/composables/useWebRTC'
import { useEventBus } from '@/utils/event-bus'

interface Props {
    callerName: string
    callerId: string | number
    callType: 'video' | 'audio'
    isOutgoing?: boolean // Новый prop для определения типа звонка
    offer?: RTCSessionDescriptionInit // Для входящих звонков
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'accept-call': []
    'decline-call': []
    'cancel-connection': []
    'call-ended': []
}>()

// Используем event bus для подписки на события
const eventBus = useEventBus()

// Используем композабл WebRTC
const {
    callState,
    getLocalStream,
    getRemoteStream,
    prepareCall,
    sendOffer,
    prepareAcceptCall,
    sendAnswer,
    handleAnswer,
    handleIceCandidate,
    toggleLocalVideo,
    toggleLocalAudio,
    endCall,
} = useWebRTC()

// Нереактивные переменные для медиа потоков (MediaStream не должен быть реактивным!)
let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null

// Реактивные флаги для отслеживания наличия потоков (для v-if)
const hasLocalStream = ref(false)
const hasRemoteStream = ref(false)

// Звук входящего звонка - НЕ реактивный для лучшей производительности
let ringtoneAudio: HTMLAudioElement | null = null
const audioError = ref<string | null>(null)
const isAudioPlaying = ref(false)
const isAudioStopped = ref(false) // Флаг для предотвращения повторного запуска

// Refs для видео элементов - каждый поток имеет свой элемент
const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)

// Флаг для переключения между большим и маленьким видео
const showLocalVideoLarge = ref(false)

// Флаг для блокировки кнопки Accept (предотвращение повторного нажатия)
const isAccepting = ref(false)

// Флаг готовности локального видео потока
const isLocalVideoReady = ref(false)

// Флаг для отслеживания готовности к началу звонка
const isReadyToCall = ref(false)

// Computed для отображения маленького видео - только когда соединение установлено И есть оба потока
const shouldShowSmallVideo = computed(() => {
    const result = callState.value.isConnected && hasLocalStream.value && hasRemoteStream.value
    console.log('shouldShowSmallVideo computed:', {
        result,
        isConnected: callState.value.isConnected,
        hasLocalStream: hasLocalStream.value,
        hasRemoteStream: hasRemoteStream.value,
    })
    return result
})

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

// Функция для ожидания готовности видео элемента
const waitForVideoReady = (videoElement: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Video ready timeout'))
        }, 10000) // 10 секунд таймаут

        const onLoadedData = () => {
            console.log('Video loadeddata event fired')
            cleanup()
            resolve()
        }

        const onCanPlay = () => {
            console.log('Video canplay event fired')
            cleanup()
            resolve()
        }

        const onError = (error: Event) => {
            console.error('Video error event:', error)
            cleanup()
            reject(new Error('Video loading error'))
        }

        const cleanup = () => {
            clearTimeout(timeout)
            videoElement.removeEventListener('loadeddata', onLoadedData)
            videoElement.removeEventListener('canplay', onCanPlay)
            videoElement.removeEventListener('error', onError)
        }

        // Если видео уже готово
        if (videoElement.readyState >= 2) {
            console.log('Video already ready, readyState:', videoElement.readyState)
            cleanup()
            resolve()
            return
        }

        videoElement.addEventListener('loadeddata', onLoadedData)
        videoElement.addEventListener('canplay', onCanPlay)
        videoElement.addEventListener('error', onError)
    })
}

// Функция для установки медиа потоков в video элементы - устанавливаем только один раз
const attachMediaStreams = async () => {
    console.log('attachMediaStreams called:', {
        hasLocalVideoRef: !!localVideoRef.value,
        hasRemoteVideoRef: !!remoteVideoRef.value,
        hasLocalStream: !!localStream,
        hasRemoteStream: !!remoteStream,
        isConnected: callState.value.isConnected,
        isOutgoing: props.isOutgoing,
    })

    try {
        // Устанавливаем локальный поток только один раз
        if (localStream && localVideoRef.value && !localVideoRef.value.srcObject) {
            localVideoRef.value.srcObject = localStream
            console.log('✅ Set local video stream')

            // Для видео звонков дожидаемся готовности видео
            if (props.callType === 'video') {
                try {
                    await localVideoRef.value.play()
                    await waitForVideoReady(localVideoRef.value)
                    isLocalVideoReady.value = true
                    console.log('✅ Local video is ready for display')
                } catch (error) {
                    console.error('Error preparing local video:', error)
                    isLocalVideoReady.value = false
                }
            } else {
                // Для аудио звонков сразу считаем готовым
                isLocalVideoReady.value = true
            }
        }

        // Устанавливаем удаленный поток только один раз
        if (remoteStream && remoteVideoRef.value && !remoteVideoRef.value.srcObject) {
            remoteVideoRef.value.srcObject = remoteStream
            console.log('✅ Set remote video stream')
            await remoteVideoRef.value.play().catch((e) => {
                console.error('Error playing remote video:', e)
            })
        }

        // Управляем отображением через флаг
        updateVideoLayout()
    } catch (error) {
        console.error('Error in attachMediaStreams:', error)
    }
}

// Функция для обновления макета видео без изменения потоков
const updateVideoLayout = () => {
    if (callState.value.isConnected && hasLocalStream.value && hasRemoteStream.value) {
        // Когда соединение установлено - показываем удаленное видео большим
        showLocalVideoLarge.value = false
        console.log('✅ Layout: Remote video large, local video small')
    } else if (hasLocalStream.value) {
        // До соединения показываем локальное видео большим
        showLocalVideoLarge.value = true
        console.log('✅ Layout: Local video large')
    }
}

onMounted(async () => {
    await nextTick()

    console.log('VideoCallModal mounted, subscribing to events...')

    // Подписываемся на события обновления медиа потоков
    eventBus.on('webrtc_local_stream_updated', handleLocalStreamUpdated)
    eventBus.on('webrtc_remote_stream_updated', handleRemoteStreamUpdated)
    eventBus.on('webrtc_streams_cleared', handleStreamsCleared)
    eventBus.on('webrtc_connection_state_changed', handleConnectionStateChanged)

    // Подписываемся на события WebRTC signaling
    eventBus.on('webrtc_answer_received', handleAnswerReceived)
    eventBus.on('webrtc_candidate_received', handleCandidateReceived)
    eventBus.on('webrtc_call_end_received', handleCallEndReceived)

    console.log('VideoCallModal subscribed to all events')

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
    } else {
        // Для исходящих звонков сначала получаем локальный поток
        console.log('Preparing outgoing call - getting local stream first...')
        showLocalVideoLarge.value = true

        // Запускаем процесс получения медиа потока
        try {
            await prepareCall(props.callType, props.callerId)
            console.log('Call prepared, waiting for video to be ready...')
        } catch (error) {
            console.error('Failed to prepare outgoing call:', error)
        }
    }
})

onUnmounted(() => {
    console.log('VideoCallModal unmounted - cleaning up')

    // Сбрасываем флаг принятия звонка
    isAccepting.value = false

    // Отписываемся от событий
    eventBus.off('webrtc_local_stream_updated', handleLocalStreamUpdated)
    eventBus.off('webrtc_remote_stream_updated', handleRemoteStreamUpdated)
    eventBus.off('webrtc_streams_cleared', handleStreamsCleared)
    eventBus.off('webrtc_connection_state_changed', handleConnectionStateChanged)
    eventBus.off('webrtc_answer_received', handleAnswerReceived)
    eventBus.off('webrtc_candidate_received', handleCandidateReceived)
    eventBus.off('webrtc_call_end_received', handleCallEndReceived)

    stopRingtone()
    if (ringtoneAudio) {
        ringtoneAudio.removeEventListener('loadeddata', () => {})
        ringtoneAudio.removeEventListener('error', () => {})
        ringtoneAudio.removeEventListener('canplaythrough', () => {})
        ringtoneAudio = null
    }
    // Завершаем звонок и очищаем WebRTC ресурсы
    endCall()
})

const handleAccept = async () => {
    // Проверяем, не идет ли уже процесс принятия звонка
    if (isAccepting.value) {
        console.log('Call is already being accepted, ignoring duplicate click')
        return
    }

    console.log('handleAccept called - stopping ringtone and accepting call')
    console.log('isAccepting BEFORE:', isAccepting.value)

    // Блокируем кнопку
    isAccepting.value = true
    console.log('isAccepting AFTER set to true:', isAccepting.value)

    // Ждем, пока Vue обновит DOM
    await nextTick()
    console.log('DOM updated after setting isAccepting')

    stopRingtone()

    try {
        // Принимаем входящий звонок с передачей targetUserId (callerId)
        if (props.offer) {
            console.log('Calling acceptCall...')

            // Сначала подготавливаем принятие звонка (получаем медиа поток)
            try {
                console.log('Preparing to accept call...')
                const prepared = await prepareAcceptCall(
                    props.callType,
                    props.offer,
                    props.callerId,
                )
                console.log('prepareAcceptCall returned:', prepared)

                if (prepared) {
                    console.log('Call prepared successfully, waiting for local stream...')

                    // Обновляем локальные потоки из композабла
                    localStream = getLocalStream()
                    remoteStream = getRemoteStream()
                    hasLocalStream.value = !!localStream
                    hasRemoteStream.value = !!remoteStream

                    console.log('Streams after prepare:', {
                        localStream: !!localStream,
                        remoteStream: !!remoteStream,
                    })

                    // Привязываем потоки к video элементам и дожидаемся готовности
                    await nextTick()
                    await attachMediaStreams()

                    // Для видео звонков дожидаемся готовности локального видео
                    if (props.callType === 'video' && localStream && localVideoRef.value) {
                        console.log('Waiting for local video to be ready before sending answer...')
                        // Ждем готовности видео (уже обрабатывается в attachMediaStreams)
                        let attempts = 0
                        const maxAttempts = 50 // 5 секунд максимум
                        while (!isLocalVideoReady.value && attempts < maxAttempts) {
                            await new Promise((resolve) => setTimeout(resolve, 100))
                            attempts++
                        }

                        if (!isLocalVideoReady.value) {
                            console.warn(
                                'Local video not ready after timeout, sending answer anyway',
                            )
                        } else {
                            console.log('Local video is ready, sending answer...')
                        }
                    }

                    // Теперь отправляем answer
                    const answerSent = await sendAnswer(props.callerId)
                    if (answerSent) {
                        console.log('Answer sent successfully, call accepted')
                        emit('accept-call')
                    } else {
                        console.error('Failed to send answer')
                    }

                    // Не сбрасываем флаг сразу, чтобы предотвратить повторные нажатия
                    // Флаг будет сброшен при размонтировании компонента или изменении состояния
                } else {
                    // Если не удалось подготовить принятие звонка, разблокируем кнопку
                    console.error('Call preparation failed, resetting isAccepting')
                    // isAccepting.value = false
                }
            } catch (error) {
                console.error('Error during call acceptance:', error)
                // isAccepting.value = false
            }
        } else {
            console.log('No offer provided, resetting isAccepting')
            // isAccepting.value = false
        }
    } catch (error) {
        console.error('Error accepting call:', error)
        // Разблокируем кнопку при ошибке
        // isAccepting.value = false
        console.log('Error occurred, isAccepting reset to:', isAccepting.value)
    }
}

const handleDecline = () => {
    console.log('handleDecline called - declining call')
    stopRingtone()
    endCall()
    emit('decline-call')
}

const handleCancelConnection = () => {
    console.log('handleCancelConnection called - cancelling connection')
    stopRingtone()
    endCall()
    emit('cancel-connection')
}

const handleEndCall = () => {
    console.log('handleEndCall called - ending call')
    stopRingtone()
    endCall()
    emit('call-ended')
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
    () => callState.value.isConnecting || callState.value.isConnected || callState.value.error,
    (stateChanged) => {
        // Останавливаем звук при любом изменении состояния соединения
        if (stateChanged) {
            console.log('Stopping ringtone due to connection state change:', {
                isConnecting: callState.value.isConnecting,
                isConnected: callState.value.isConnected,
                error: callState.value.error,
            })
            stopRingtone()
        }
    },
    { immediate: false },
)

// Обработчики событий для обновления медиа потоков
const handleLocalStreamUpdated = async () => {
    console.log('🔵 handleLocalStreamUpdated CALLED from event bus')
    const streamBefore = localStream
    localStream = getLocalStream()
    hasLocalStream.value = !!localStream
    console.log('🔵 Local stream updated:', {
        hadStreamBefore: !!streamBefore,
        hasStreamNow: !!localStream,
        hasLocalStreamFlag: hasLocalStream.value,
        tracks: localStream?.getTracks().length,
        videoTracks: localStream?.getVideoTracks().length,
        audioTracks: localStream?.getAudioTracks().length,
        videoEnabled: localStream?.getVideoTracks()[0]?.enabled,
    })

    // Немедленно обновляем потоки без таймеров
    await nextTick()
    await attachMediaStreams()

    // Если это исходящий звонок и поток готов, отправляем offer
    if (props.isOutgoing && localStream && isLocalVideoReady.value && !isReadyToCall.value) {
        console.log('🔵 Local stream ready for outgoing call, sending offer...')
        isReadyToCall.value = true
        try {
            await sendOffer(props.callType, props.callerId)
            console.log('🔵 Offer sent successfully from handleLocalStreamUpdated')
        } catch (error) {
            console.error('🔵 Failed to send offer from handleLocalStreamUpdated:', error)
            isReadyToCall.value = false
        }
    }
}

const handleRemoteStreamUpdated = async () => {
    console.log('🟢 handleRemoteStreamUpdated CALLED from event bus')
    const streamBefore = remoteStream
    remoteStream = getRemoteStream()
    hasRemoteStream.value = !!remoteStream
    console.log('🟢 Remote stream updated:', {
        hadStreamBefore: !!streamBefore,
        hasStreamNow: !!remoteStream,
        hasRemoteStreamFlag: hasRemoteStream.value,
        tracks: remoteStream?.getTracks().length,
        videoTracks: remoteStream?.getVideoTracks().length,
        audioTracks: remoteStream?.getAudioTracks().length,
        videoEnabled: remoteStream?.getVideoTracks()[0]?.enabled,
    })

    // Немедленно обновляем потоки без таймеров
    await nextTick()
    await attachMediaStreams()
}

const handleStreamsCleared = async () => {
    console.log('Streams cleared from event bus')
    localStream = null
    remoteStream = null
    hasLocalStream.value = false
    hasRemoteStream.value = false
    isLocalVideoReady.value = false
    isReadyToCall.value = false
    await nextTick()
    await attachMediaStreams()
}

// Обработчик изменения состояния соединения
const handleConnectionStateChanged = async (payload: {
    state: string
    isConnecting: boolean
    isConnected: boolean
    error?: string | null
}) => {
    console.log('🔗 Connection state changed:', payload)

    // Когда соединение установлено, обновляем макет видео
    if (payload.isConnected) {
        console.log('🔗 Connection established, updating video layout')
        await nextTick()
        updateVideoLayout()
    }
}

// Обработчик получения answer от удаленного пользователя
const handleAnswerReceived = (payload: { answer: RTCSessionDescriptionInit }) => {
    console.log('Answer received from remote user:', payload.answer)
    handleAnswer(payload.answer)
}

// Обработчик получения ICE candidate от удаленного пользователя
const handleCandidateReceived = (payload: { candidate: RTCIceCandidateInit }) => {
    console.log('ICE candidate received from remote user:', payload.candidate)
    handleIceCandidate(payload.candidate)
}

// Обработчик завершения звонка от удаленного пользователя
const handleCallEndReceived = (payload: { targetUserId: string | number; reason?: string }) => {
    console.log('Call end received from remote user:', payload)

    // Останавливаем звук
    stopRingtone()

    // Завершаем звонок локально (без отправки события обратно)
    endCall(payload.reason, true) // skipEmitEvent = true

    // Эмитируем событие завершения для закрытия модального окна
    emit('call-ended')
}

// Отслеживаем состояние соединения для сброса флага принятия звонка
watch(
    () => callState.value.isConnected,
    (isConnected) => {
        if (isConnected) {
            console.log('Call connected - resetting accept flag')
            // Сбрасываем флаг принятия звонка
            isAccepting.value = false
            console.log('isAccepting reset to false after connection established')
        }
    },
)

// Отслеживаем ошибки для сброса флага
watch(
    () => callState.value.error,
    (error) => {
        if (error) {
            console.log('Call error detected, resetting isAccepting:', error)
            isAccepting.value = false
        }
    },
)

// Отслеживаем появление маленького видео
watch(shouldShowSmallVideo, async (shouldShow, wasShowing) => {
    console.log('shouldShowSmallVideo changed:', { shouldShow, wasShowing })
    if (shouldShow && !wasShowing) {
        console.log('Small video appeared, updating layout immediately')
        await nextTick()
        updateVideoLayout()
    }
})

// Отслеживаем готовность локального видео для исходящих звонков
watch(isLocalVideoReady, async (isReady) => {
    console.log('isLocalVideoReady changed:', isReady)
    if (isReady && props.isOutgoing && localStream && !isReadyToCall.value) {
        console.log('Local video ready for outgoing call, sending offer...')
        isReadyToCall.value = true
        try {
            await sendOffer(props.callType, props.callerId)
            console.log('Offer sent successfully after video ready')
        } catch (error) {
            console.error('Failed to send offer after video ready:', error)
            isReadyToCall.value = false
        }
    }
})
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
                    {{ callerName ? callerName.substring(0, 2).toUpperCase() : 'U' }}
                </div>
                <h2 class="caller-name">{{ callerName || 'Unknown' }}</h2>
                <p class="call-type-label">
                    <template v-if="callState.isConnecting">
                        Connecting {{ callType === 'video' ? 'video' : 'voice' }} call...
                    </template>
                    <template v-else-if="callState.isConnected">
                        {{ callType === 'video' ? 'Video' : 'Voice' }} call connected!
                    </template>
                    <template v-else-if="callState.error">
                        Call error: {{ callState.error }}
                    </template>
                    <template v-else>
                        {{ props.isOutgoing ? 'Calling' : 'Incoming' }}
                        {{ callType === 'video' ? 'video' : 'voice' }} call...
                    </template>
                </p>

                <!-- Показываем статус аудио только для входящих звонков -->
                <div
                    v-if="
                        !props.isOutgoing &&
                        !callState.isConnecting &&
                        !callState.isConnected &&
                        !callState.error
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

            <!-- Видео элементы для видео звонка -->
            <div v-if="callType === 'video'" class="video-container">
                <!-- Локальное видео -->
                <div
                    class="video-wrapper"
                    :class="{
                        'video-large': showLocalVideoLarge,
                        'video-small': !showLocalVideoLarge && shouldShowSmallVideo,
                        'video-hidden': !showLocalVideoLarge && !shouldShowSmallVideo,
                    }"
                >
                    <video
                        ref="localVideoRef"
                        autoplay
                        playsinline
                        muted
                        class="video-player"
                    ></video>
                    <div
                        class="avatar-circle"
                        v-if="!localStream || !callState.isLocalVideoEnabled"
                    >
                        ME
                    </div>
                    <div class="call-status" v-if="showLocalVideoLarge">You</div>
                </div>

                <!-- Удаленное видео -->
                <div
                    class="video-wrapper"
                    :class="{
                        'video-large': !showLocalVideoLarge && hasRemoteStream,
                        'video-small': showLocalVideoLarge && shouldShowSmallVideo,
                        'video-hidden': !hasRemoteStream,
                    }"
                >
                    <video ref="remoteVideoRef" autoplay playsinline class="video-player"></video>
                    <div class="avatar-circle" v-if="!remoteStream">
                        {{ callerName ? callerName.substring(0, 2).toUpperCase() : 'U' }}
                    </div>
                    <div class="call-status" v-if="!showLocalVideoLarge && hasRemoteStream">
                        {{ callerName || 'Caller' }}
                    </div>
                </div>
            </div>

            <!-- Индикатор состояния соединения -->
            <div v-if="callState.isConnecting" class="connection-status connecting">
                <div class="connection-loader"></div>
                <p>Establishing connection...</p>
            </div>

            <div v-else-if="callState.isConnected" class="connection-status connected">
                <div class="connection-success">✓</div>
                <p>Call connected successfully!</p>
            </div>

            <div v-else-if="callState.error" class="connection-status error">
                <div class="connection-error">⚠</div>
                <p>{{ callState.error }}</p>
            </div>

            <!-- Кнопки управления звонком -->
            <div class="call-actions">
                <!-- Показываем кнопку отмены во время установки соединения -->
                <template v-if="callState.isConnecting">
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

                <!-- Во время соединения или ошибки -->
                <template v-else-if="!callState.isConnected">
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
                            :disabled="isAccepting"
                            :class="{ accepting: isAccepting }"
                        >
                            <!-- Спиннер при принятии звонка -->
                            <div v-if="isAccepting" class="button-spinner"></div>

                            <!-- Иконка телефона -->
                            <svg
                                v-if="!isAccepting"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                                    fill="currentColor"
                                />
                            </svg>

                            <span v-if="!isAccepting">Accept</span>
                            <span v-else>Accepting...</span>
                        </button>
                    </template>
                </template>

                <!-- Когда соединение установлено - показываем кнопки управления -->
                <template v-else>
                    <!-- Кнопка переключения видео (только для видео звонков) -->
                    <button
                        v-if="callType === 'video'"
                        class="call-button control"
                        @click="toggleLocalVideo"
                        :title="
                            callState.isLocalVideoEnabled ? 'Turn off camera' : 'Turn on camera'
                        "
                        :class="{ disabled: !callState.isLocalVideoEnabled }"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                v-if="callState.isLocalVideoEnabled"
                                d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                                fill="currentColor"
                            />
                            <path
                                v-else
                                d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>{{ callState.isLocalVideoEnabled ? 'Camera' : 'Camera Off' }}</span>
                    </button>

                    <!-- Кнопка переключения аудио -->
                    <button
                        class="call-button control"
                        @click="toggleLocalAudio"
                        :title="
                            callState.isLocalAudioEnabled ? 'Mute microphone' : 'Unmute microphone'
                        "
                        :class="{ disabled: !callState.isLocalAudioEnabled }"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                v-if="callState.isLocalAudioEnabled"
                                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
                                fill="currentColor"
                            />
                            <path
                                v-else
                                d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V20h2v-2.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>{{ callState.isLocalAudioEnabled ? 'Mute' : 'Unmute' }}</span>
                    </button>

                    <!-- Кнопка завершения звонка -->
                    <button class="call-button decline" @click="handleEndCall" title="End call">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>End Call</span>
                    </button>
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

.call-button.accept.accepting {
    background-color: #81c784 !important;
    animation: acceptingPulse 1s ease-in-out infinite !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}

.call-button.accept.accepting:hover {
    background-color: #81c784 !important;
    transform: none !important;
    box-shadow: none !important;
}

/* Спиннер в кнопке Accept */
.button-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Анимация пульсации при принятии */
@keyframes acceptingPulse {
    0% {
        opacity: 0.8;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.8;
    }
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

.call-button.control {
    background-color: #2196f3;
    color: white;
}

.call-button.control:hover {
    background-color: #1976d2;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.call-button.control.disabled {
    background-color: #9e9e9e;
}

.call-button.control.disabled:hover {
    background-color: #757575;
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

.video-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
}

/* Большое видео */
.video-wrapper.video-large {
    width: 100%;
    z-index: 1;
}

.video-wrapper.video-large .video-player {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.video-wrapper.video-large .avatar-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    width: 120px;
    height: 120px;
    font-size: 40px;
}

/* Маленькое видео */
.video-wrapper.video-small {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 5px;
    z-index: 2;
}

.video-wrapper.video-small .video-player {
    width: 120px;
    height: 90px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.video-wrapper.video-small .avatar-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    width: 60px;
    height: 60px;
    font-size: 20px;
}

/* Скрытое видео */
.video-wrapper.video-hidden {
    display: none;
}

/* Общие стили для video элементов */
.video-player {
    border-radius: 10px;
    background-color: #000;
    object-fit: cover;
}

/* Общие стили для аватаров */
.avatar-circle {
    background-color: var(--primary-color);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
