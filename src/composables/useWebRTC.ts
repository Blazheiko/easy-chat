import { ref, onUnmounted } from 'vue'
import { useEventBus } from '@/utils/event-bus'

export interface WebRTCConfig {
    iceServers: RTCIceServer[]
}

export interface CallState {
    isConnecting: boolean
    isConnected: boolean
    isLocalVideoEnabled: boolean
    isLocalAudioEnabled: boolean
    isRemoteVideoEnabled: boolean
    isRemoteAudioEnabled: boolean
    error: string | null
}

export const useWebRTC = () => {
    const eventBus = useEventBus()

    // WebRTC состояние
    let peerConnection: RTCPeerConnection | null = null // Не реактивный - используется только внутри composable
    const localStream = ref<MediaStream | null>(null) // Реактивный - используется в UI
    const remoteStream = ref<MediaStream | null>(null) // Реактивный - используется в UI
    const callState = ref<CallState>({
        isConnecting: false,
        isConnected: false,
        isLocalVideoEnabled: false,
        isLocalAudioEnabled: false,
        isRemoteVideoEnabled: false,
        isRemoteAudioEnabled: false,
        error: null,
    })

    // Конфигурация ICE серверов (можно вынести в настройки)
    const defaultConfig: WebRTCConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ],
    }

    // Инициализация WebRTC соединения
    const initializePeerConnection = (config: WebRTCConfig = defaultConfig) => {
        try {
            peerConnection = new RTCPeerConnection(config)

            // Обработчики событий WebRTC
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('ICE candidate:', event.candidate)
                    // Отправляем ICE candidate через WebSocket
                    eventBus.emit('webrtc_ice_candidate', {
                        candidate: event.candidate,
                    })
                }
            }

            peerConnection.oniceconnectionstatechange = () => {
                const state = peerConnection?.iceConnectionState
                console.log('ICE connection state:', state)

                if (!state) return

                switch (state as RTCIceConnectionState) {
                    case 'checking':
                    case 'new':
                        callState.value.isConnecting = true
                        callState.value.isConnected = false
                        callState.value.error = null
                        break
                    case 'connected':
                    case 'completed':
                        callState.value.isConnecting = false
                        callState.value.isConnected = true
                        callState.value.error = null
                        break
                    case 'disconnected':
                    case 'failed':
                    case 'closed':
                        callState.value.isConnecting = false
                        callState.value.isConnected = false
                        if (state === 'failed') {
                            callState.value.error = 'Connection failed'
                        }
                        break
                }
            }

            peerConnection.ontrack = (event) => {
                console.log('Remote track received:', event)
                if (event.streams && event.streams[0]) {
                    remoteStream.value = event.streams[0]

                    // Проверяем типы треков
                    event.streams[0].getTracks().forEach((track) => {
                        if (track.kind === 'video') {
                            callState.value.isRemoteVideoEnabled = track.enabled
                        } else if (track.kind === 'audio') {
                            callState.value.isRemoteAudioEnabled = track.enabled
                        }
                    })
                }
            }

            peerConnection.ondatachannel = (event) => {
                console.log('Data channel received:', event.channel)
                // Можно добавить обработку data channel для дополнительных функций
            }

            return peerConnection
        } catch (error) {
            console.error('Failed to initialize peer connection:', error)
            callState.value.error = 'Failed to initialize connection'
            return null
        }
    }

    // Получение пользовательских медиа (камера/микрофон)
    const getUserMedia = async (constraints: MediaStreamConstraints) => {
        try {
            callState.value.error = null
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            localStream.value = stream

            // Обновляем состояние локальных медиа
            stream.getTracks().forEach((track) => {
                if (track.kind === 'video') {
                    callState.value.isLocalVideoEnabled = track.enabled
                } else if (track.kind === 'audio') {
                    callState.value.isLocalAudioEnabled = track.enabled
                }
            })

            return stream
        } catch (error) {
            console.error('Failed to get user media:', error)
            callState.value.error = 'Failed to access camera/microphone'
            throw error
        }
    }

    // Начало исходящего звонка
    const startCall = async (callType: 'video' | 'audio', targetUserId: string | number) => {
        try {
            callState.value.isConnecting = true
            callState.value.error = null

            // Инициализируем peer connection
            const pc = initializePeerConnection()
            if (!pc) throw new Error('Failed to initialize peer connection')

            // Получаем пользовательские медиа
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: callType === 'video',
            }

            const stream = await getUserMedia(constraints)

            // Добавляем локальные треки в peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream)
            })

            // Создаем offer
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            // Отправляем offer через WebSocket
            eventBus.emit('webrtc_call_offer', {
                targetUserId,
                callType,
                offer: offer,
            })

            console.log('Call started, offer sent')
            return true
        } catch (error) {
            console.error('Failed to start call:', error)
            callState.value.isConnecting = false
            callState.value.error = 'Failed to start call'
            return false
        }
    }

    // Принятие входящего звонка
    const acceptCall = async (callType: 'video' | 'audio', offer: RTCSessionDescriptionInit) => {
        try {
            callState.value.isConnecting = true
            callState.value.error = null

            // Инициализируем peer connection
            const pc = initializePeerConnection()
            if (!pc) throw new Error('Failed to initialize peer connection')

            // Получаем пользовательские медиа
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: callType === 'video',
            }

            const stream = await getUserMedia(constraints)

            // Добавляем локальные треки в peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream)
            })

            // Устанавливаем удаленное описание (offer)
            await pc.setRemoteDescription(offer)

            // Создаем answer
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            // Отправляем answer через WebSocket
            eventBus.emit('webrtc_call_answer', {
                answer: answer,
            })

            console.log('Call accepted, answer sent')
            return true
        } catch (error) {
            console.error('Failed to accept call:', error)
            callState.value.isConnecting = false
            callState.value.error = 'Failed to accept call'
            return false
        }
    }

    // Обработка полученного answer
    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        try {
            if (!peerConnection) {
                throw new Error('Peer connection not initialized')
            }

            await peerConnection.setRemoteDescription(answer)
            console.log('Answer processed successfully')
        } catch (error) {
            console.error('Failed to handle answer:', error)
            callState.value.error = 'Failed to process answer'
        }
    }

    // Обработка ICE candidate
    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        try {
            if (!peerConnection) {
                throw new Error('Peer connection not initialized')
            }

            await peerConnection.addIceCandidate(candidate)
            console.log('ICE candidate added successfully')
        } catch (error) {
            console.error('Failed to add ICE candidate:', error)
        }
    }

    // Переключение локального видео
    const toggleLocalVideo = () => {
        if (localStream.value) {
            const videoTrack = localStream.value.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                callState.value.isLocalVideoEnabled = videoTrack.enabled
            }
        }
    }

    // Переключение локального аудио
    const toggleLocalAudio = () => {
        if (localStream.value) {
            const audioTrack = localStream.value.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                callState.value.isLocalAudioEnabled = audioTrack.enabled
            }
        }
    }

    // Завершение звонка
    const endCall = () => {
        try {
            // Останавливаем локальные треки
            if (localStream.value) {
                localStream.value.getTracks().forEach((track) => {
                    track.stop()
                })
                localStream.value = null
            }

            // Закрываем peer connection
            if (peerConnection) {
                peerConnection.close()
                peerConnection = null
            }

            // Сбрасываем состояние
            callState.value = {
                isConnecting: false,
                isConnected: false,
                isLocalVideoEnabled: false,
                isLocalAudioEnabled: false,
                isRemoteVideoEnabled: false,
                isRemoteAudioEnabled: false,
                error: null,
            }

            remoteStream.value = null

            console.log('Call ended successfully')
        } catch (error) {
            console.error('Error ending call:', error)
        }
    }

    // Очистка ресурсов при размонтировании
    onUnmounted(() => {
        endCall()
    })

    return {
        // Состояние
        callState,
        localStream,
        remoteStream,

        // Методы
        startCall,
        acceptCall,
        handleAnswer,
        handleIceCandidate,
        toggleLocalVideo,
        toggleLocalAudio,
        endCall,
    }
}
