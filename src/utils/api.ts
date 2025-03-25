import WebsocketBase from './websocket-base'

interface HttpResponse {
    [key: string]: unknown
}

// Обновленный интерфейс с правильной типизацией ответа
interface ApiResponse<T> {
    data: T | null
    error: { message: string; code: number } | null
}

interface ApiMethods {
    http: <T = HttpResponse>(
        method: string,
        route: string,
        body?: Record<string, unknown>,
    ) => Promise<ApiResponse<T>>
    ws: <T = HttpResponse>(route: string, body?: Record<string, unknown>) => Promise<T | null>
    setWebSocketClient: (client: WebsocketBase) => void
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string

interface RequestInit {
    method: HttpMethod
    headers: Record<string, string>
    body?: string
}
const BASE_URL = 'http://127.0.0.1:5174'
let webSocketClient: WebsocketBase | null = null

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
        } catch (error) {
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

    setWebSocketClient: (client: WebsocketBase) => {
        webSocketClient = client
    },

    ws: async <T = HttpResponse>(
        route: string,
        body: Record<string, unknown> = {},
    ): Promise<T | null> => {
        if (!webSocketClient) return null

        try {
            const result = await webSocketClient.api(route, body)
            console.log({ result })
            return result as unknown as T
        } catch (e) {
            console.error(e)
            return null
        }
    },
}

// // Создание экземпляра API
// const api = createApi('http://127.0.0.1:8088', new WebsocketBase('ws://127.0.0.1:8088'))

export default api
