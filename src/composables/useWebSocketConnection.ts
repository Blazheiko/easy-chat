// src/composables/useWebSocketConnection.ts
import { useWebSocket } from '@vueuse/core'
import { ref, computed } from 'vue'
import type { WebsocketMessage, WebsocketPayload } from '@/utils/websocket-base'
import { useBroadcastHandler } from '@/composables/useBroadcastHandler'
import { useEventBus } from '@/utils/event-bus'

// Interfaces for API resolve
interface ApiResolveItem {
    resolve: (data: WebsocketMessage) => void
    reject: (error?: ApiError) => void
    timeout: number
}

interface ApiError {
    status?: number
    message?: string
    messages?: string[]
}

interface SendPayload {
    event: string
    timestamp: number
    payload: Record<string, unknown>
}

// ============================================================================
// SINGLETON STATE - Created once on first module import
// ============================================================================

// Lazy-loaded broadcast handler (created when first needed)
let broadcastHandler: ReturnType<typeof useBroadcastHandler> | null = null
const getBroadcastHandler = () => {
    if (!broadcastHandler) {
        broadcastHandler = useBroadcastHandler()
    }
    return broadcastHandler
}

const eventBus = useEventBus()
// WebSocket state (created once)
const wsUrl = ref<string>('')
const isInitialized = ref(false)

// API resolve for handling responses (created once)
const apiResolve = ref<Record<string, ApiResolveItem>>({})
const TIMEOUT_API = 10000

// ============================================================================
// INTERNAL FUNCTIONS - Created once on module load
// ============================================================================

// Message validation function
const validateMessage = (message: WebsocketMessage): boolean => {
    return Boolean(
        message &&
            typeof message.event === 'string' &&
            (!message.payload || typeof message.payload === 'object'),
    )
}

// Service events handling
const service = (data: WebsocketMessage): void => {
    const serviceHandlers: Record<string, (payload: WebsocketPayload) => void | boolean> = {
        pong: () => {
            console.log('Pong received')
        },
        connection_established: (payload: WebsocketPayload) => {
            isInitialized.value = true
            console.log('connection_established', payload)
        },
        connection_closed: () => {
            console.log('Server requested connection close')
            // Don't call websocketClose() here - let server close with proper code
            // onDisconnected will handle the close event with the correct code
        },
    }

    if (data && data.event) {
        const arr = data.event.split(':')
        if (arr.length < 2) return
        const handlerName = arr[1]
        const handler = serviceHandlers[handlerName]
        if (handler) handler(data.payload)
    }
}

// Broadcast events handling
const processBroadcast = (message: WebsocketMessage): void => {
    console.log('processBroadcast', message)
    // Use lazy-loaded broadcast handler from composable
    const { handleBroadcast } = getBroadcastHandler()
    handleBroadcast(message)
}

// Service error handling
const handleServiceError = (data: WebsocketMessage): void => {
    if (data.status === 4001) {
        console.warn('Token expired or invalid:', data.payload.message)
        eventBus.emit('unauthorized')
        websocketClose()
    }
}

// Handle WebSocket close event
const handleWebSocketClose = (event: CloseEvent): void => {
    console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`)

    // Code 4001: Unauthorized - redirect to login
    if (event.code === 4001) {
        console.warn('WebSocket closed due to authentication error (4001)')
        eventBus.emit('unauthorized')
        websocketClose()
        return
    }

    // Codes 4000-4099: Cannot reconnect
    if (event.code >= 4000 && event.code < 4100) {
        console.error(`WebSocket closed with code ${event.code}. Reconnection is not allowed.`)
        websocketClose()
        return
    }

    // For other codes, let autoReconnect handle it
    console.log('WebSocket will attempt to reconnect automatically')
}

// API response handling
const messageHandler = (data: WebsocketMessage): void => {
    console.log('message handler')
    const cb = apiResolve.value[data.event]
    if (!cb) return

    window.clearTimeout(cb.timeout)
    delete apiResolve.value[data.event]

    if (data.status === 200 && cb.resolve) {
        cb.resolve(data)
    } else if (cb.reject) {
        cb.reject({
            status: data?.status,
            message: data?.payload?.message as string | undefined,
            messages: data?.payload?.messages as string[] | undefined,
        })
    }
}

// Incoming message handler
const handleMessage = (messageData: string) => {
    try {
        console.log('onmessage: ', messageData)
        const data: WebsocketMessage = JSON.parse(messageData)
        if (!validateMessage(data)) {
            console.error('Invalid message format:', data)
            return
        }

        if (data.event === 'service:error') {
            handleServiceError(data)
        } else if (data.event.startsWith('broadcast:')) {
            processBroadcast(data)
        } else if (data.event.startsWith('service:')) {
            service(data)
        } else if (data.event.startsWith('api')) {
            messageHandler(data)
        }
    } catch (error) {
        console.error('Error parsing message:', error)
    }
}

// ============================================================================
// WEBSOCKET INSTANCE - Created once on module load
// ============================================================================

const { status, send, close, ws } = useWebSocket(
    wsUrl, // Reactive reference to URL
    {
        immediate: false, // Do not connect automatically
        autoReconnect: {
            retries: -1,
            delay: 5000,
            onFailed() {
                console.error('WebSocket reconnection failed after maximum attempts')
            },
        },
        heartbeat: {
            message: 'ping',
            responseMessage: 'pong',
            interval: 10000,
            pongTimeout: 5000,
        },
        onConnected() {
            console.log('WebSocket connected')
            isInitialized.value = true
        },
        onDisconnected(_, event) {
            console.log('WebSocket disconnected', event)
            isInitialized.value = false
            // Handle close event with proper code checking
            if (event) {
                handleWebSocketClose(event)
            }
        },
        onError(_, event) {
            console.error('WebSocket error:', event)
        },
        onMessage(_, event) {
            handleMessage(event.data)
        },
    },
)

// ============================================================================
// PUBLIC API - Methods for working with WebSocket
// ============================================================================

// Send messages
const sendMessage = (data: SendPayload) => {
    if (status.value === 'OPEN') {
        send(JSON.stringify(data))
    } else {
        console.warn('WebSocket not connected, message queued')
    }
}

// API method for compatibility with existing code
const websocketApi = async (
    route: string,
    payload: Record<string, unknown> = {},
): Promise<WebsocketMessage> => {
    return new Promise((resolve, reject) => {
        const isConnected = status.value === 'OPEN'
        if (!isConnected) {
            console.error('WebSocket not connected')
            reject(new Error('WebSocket not connected'))
            return
        }

        const event = `api/${route}` as string
        const timestamp = Date.now()
        const key = `${timestamp}_${event}`
        if (apiResolve.value[key]) {
            console.error('Request already in progress')
            reject(new Error('Request already in progress'))
            return
        }

        sendMessage({
            event: event,
            timestamp,
            payload,
        })
        apiResolve.value[event] = {
            resolve,
            reject,
            timeout: window.setTimeout(() => {
                delete apiResolve.value[event]
                reject(new Error('Request timeout'))
            }, TIMEOUT_API),
        }
    })
}

const websocketClose = () => {
    console.log('websocketClose')
    close()
    // wsUrl.value = ''
    isInitialized.value = false
    // Clear all pending API requests
    Object.values(apiResolve.value).forEach((item) => {
        window.clearTimeout(item.timeout)
        item.reject(new Error('WebSocket connection reset'))
    })
    apiResolve.value = {}
}

const websocketOpen = (url: string) => {
    wsUrl.value = url
    console.log('websocketOpen', url)
    // open()
}

// Connection state
const isConnected = computed(() => status.value === 'OPEN')
const isConnecting = computed(() => status.value === 'CONNECTING')
const isDisconnected = computed(() => status.value === 'CLOSED')

// ============================================================================
// EXPORTED COMPOSABLE - Uses JS module system as singleton
// ============================================================================

/**
 * WebSocket Connection Composable (Singleton)
 *
 * This composable uses JavaScript module system to ensure singleton behavior.
 * All code above executes only once on first module import, regardless of how
 * many times useWebSocketConnection is called.
 *
 * @returns Object with WebSocket connection methods and state
 */
export const useWebSocketConnection = () => {
    // Always return the same set of methods and state
    return {
        // State
        statusWebSocket: status,
        isConnected,
        isConnecting,
        isDisconnected,
        isInitialized,

        // Methods
        sendMessage,
        websocketApi,
        websocketClose,
        websocketOpen,

        // Raw WebSocket for compatibility
        ws,
    }
}
