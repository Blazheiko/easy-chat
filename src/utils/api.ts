import WebsocketBase from './websocket-base'
import { useEventBus } from './event-bus'

interface HttpResponse {
    [key: string]: unknown
}

// Обновленный интерфейс с правильной типизацией ответа
interface ApiResponse<T> {
    data: T | null
    error: { message: string; code: number } | null
}

// Интерфейсы для Push Subscriptions
interface PushSubscriptionData extends Record<string, unknown> {
    endpoint: string
    p256dhKey: string
    authKey: string
    userAgent?: string
    ipAddress?: string
    deviceType?: string
    browserName?: string
    browserVersion?: string
    osName?: string
    osVersion?: string
    notificationTypes?: string[]
    timezone?: string
}

interface PushSubscriptionResponse {
    id: number
    user_id: number
    endpoint: string
    p256dh_key: string
    auth_key: string
    user_agent?: string
    device_type?: string
    browser_name?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

interface PushSubscriptionStatistics {
    total_sent: number
    total_delivered: number
    last_sent_at?: string
    subscription_duration: number
}

// Интерфейс для ответа при обновлении сообщения
interface UpdateMessageResponse {
    status: string
    message?: {
      id: number
      sender_id: number
      receiver_id: number
      type: string
      content: string
      src: string
      is_read: boolean
      created_at: string
      updated_at: string
    }
}

interface ApiMethods {
    http: <T = HttpResponse>(
        method: string,
        route: string,
        body?: Record<string, unknown>,
    ) => Promise<ApiResponse<T>>
    ws: <T = HttpResponse>(route: string, body?: Record<string, unknown>) => Promise<T | null>
    setWebSocketClient: (client: WebsocketBase | null) => void
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string

interface RequestInit {
    method: HttpMethod
    headers: Record<string, string>
    body?: string
}
const BASE_URL = 'http://127.0.0.1:5174'
let webSocketClient: WebsocketBase | null = null
const eventBus = useEventBus()

const api: ApiMethods = {
    http: async <T = HttpResponse>(
        method: HttpMethod,
        route: string,
        body: Record<string, unknown> = {},
    ): Promise<ApiResponse<T>> => {
        // const BASE_URL = baseUrl
        const init: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        }

        if (method.toLowerCase() !== 'get' && method.toLowerCase() !== 'delete') {
            init.body = JSON.stringify(body)
        }

        try {
            const response = await fetch(`${BASE_URL}${route}`, init)

            if (!response.ok && response.status === 422) {
                console.log('!response.ok && response.status === 422')
                const errorData = await response.json()
                console.log({ errorData })
                return {
                    data: errorData,
                    error: { code: 422, message: String(errorData.message || 'Validation Error') },
                }
            }

            if (!response.ok) {
                console.log('!response.ok')
                if (response.status === 401) {
                    eventBus.emit('unauthorized')
                    return {
                        data: null,
                        error: { code: 401, message: 'Unauthorized' },
                    }
                }
                return {
                    data: null,
                    error: {
                        code: response.status,
                        message: `HTTP error! status: ${response.status}`,
                    },
                }
            }

            const data = await response.json()
            console.log({ data })
            return { data: data as T, error: null }
        } catch (error: unknown) {
            console.error('Network error:', error)
            return {
                data: null,
                error: {
                    code: 0,
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Network error. Please try again later.',
                },
            }
        }
    },

    setWebSocketClient: (client: WebsocketBase | null) => {
        webSocketClient = client
    },

    ws: async <T = HttpResponse>(
        route: string,
        body: Record<string, unknown> = {},
    ): Promise<T | null> => {
        if (!webSocketClient) return null

        try {
            // console.log('webSocketClient')
            // console.log(webSocketClient)
            const result = await webSocketClient.api(route, body)
            console.log({ result })
            return result as unknown as T
        } catch (e) {
            console.error(e)
            return null
        }
    },
}

// API функции для сообщений
export const messagesApi = {
    // Удалить сообщение
    deleteMessage: async (messageId: number): Promise<ApiResponse<{ success: boolean }>> => {
        return api.http<{ success: boolean }>('DELETE', `/api/chat/messages/${messageId}`)
    },

    // Редактировать сообщение
    updateMessage: async (
        messageId: number,
        content: string,
        userId: number,
    ): Promise<ApiResponse<UpdateMessageResponse>> => {
        return api.http<UpdateMessageResponse>('PUT', `/api/chat/messages/${messageId}`, {
            userId,
            messageId,
            content,
        })
    },
}

// API функции для Push Subscriptions
export const pushSubscriptionApi = {
    // Получить все подписки пользователя
    getSubscriptions: async (): Promise<ApiResponse<PushSubscriptionResponse[]>> => {
        return api.http<PushSubscriptionResponse[]>('GET', '/api/push-subscriptions')
    },

    // Создать новую подписку
    createSubscription: async (
        subscriptionData: PushSubscriptionData,
    ): Promise<ApiResponse<PushSubscriptionResponse>> => {
        return api.http<PushSubscriptionResponse>(
            'POST',
            '/api/push-subscriptions',
            subscriptionData,
        )
    },

    // Получить конкретную подписку
    getSubscription: async (
        subscriptionId: number,
    ): Promise<ApiResponse<PushSubscriptionResponse>> => {
        return api.http<PushSubscriptionResponse>(
            'GET',
            `/api/push-subscriptions/${subscriptionId}`,
        )
    },

    // Удалить подписку
    deleteSubscription: async (
        subscriptionId: number,
    ): Promise<ApiResponse<{ success: boolean }>> => {
        return api.http<{ success: boolean }>('DELETE', `/api/push-subscriptions/${subscriptionId}`)
    },

    // Удалить подписку по endpoint
    deleteSubscriptionByEndpoint: async (
        endpoint: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
        return api.http<{ success: boolean }>('DELETE', '/api/push-subscriptions', { endpoint })
    },

    // Получить статистику подписки
    getSubscriptionStatistics: async (
        subscriptionId: number,
    ): Promise<ApiResponse<PushSubscriptionStatistics>> => {
        return api.http<PushSubscriptionStatistics>(
            'GET',
            `/api/push-subscriptions/${subscriptionId}/statistics`,
        )
    },

    // Деактивировать подписку
    deactivateSubscription: async (
        subscriptionId: number,
    ): Promise<ApiResponse<PushSubscriptionResponse>> => {
        return api.http<PushSubscriptionResponse>(
            'PUT',
            `/api/push-subscriptions/${subscriptionId}/deactivate`,
        )
    },

    // Отправить уведомление о статусе подписки
    sendSubscriptionNotification: async (
        notificationData: Record<string, unknown>,
    ): Promise<ApiResponse<{ success: boolean; message: string }>> => {
        return api.http<{ success: boolean; message: string }>(
            'POST',
            '/api/notifications/subscription-status',
            notificationData,
        )
    },

    // Отправить системное уведомление админам
    sendSystemNotification: async (
        message: string,
        type: string = 'info',
        metadata?: Record<string, unknown>,
    ): Promise<ApiResponse<{ success: boolean }>> => {
        return api.http<{ success: boolean }>('POST', '/api/notifications/system', {
            message,
            type,
            metadata,
        })
    },

    // Получить VAPID публичный ключ с сервера
    getVapidPublicKey: async (): Promise<ApiResponse<{ vapidPublicKey: string }>> => {
        return api.http<{ vapidPublicKey: string }>(
            'GET',
            '/api/push-subscriptions/vapid-public-key',
        )
    },
}

// // Создание экземпляра API
// const api = createApi('http://127.0.0.1:8088', new WebsocketBase('ws://127.0.0.1:8088'))

export default api
