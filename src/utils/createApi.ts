import WebsocketBase from './websocket-base'

interface HttpResponse {
  [key: string]: unknown
}

interface ApiMethods {
  http: <T = HttpResponse>(
    method: string,
    route: string,
    body?: Record<string, unknown>,
  ) => Promise<T | null>
  ws: <T = HttpResponse>(route: string, body?: Record<string, unknown>) => Promise<T | null>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string

interface RequestInit {
  method: HttpMethod
  headers: Record<string, string>
  body?: string
}

const createApi = (baseUrl: string, WebSocketClient: WebsocketBase | null): ApiMethods => ({
  http: async <T = HttpResponse>(
    method: HttpMethod,
    route: string,
    body: Record<string, unknown> = {},
  ): Promise<T | null> => {
    try {
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

      const url = `${baseUrl}${route}`
      console.log({ url })

      // const response = await fetch(`${baseUrl}${route}`, init)
      const response = await fetch(url, init)

      if (!response.ok && response.status === 422) {
        console.log('!response.ok && response.status === 422')
        const errorData = await response.json()
        console.log({ errorData })
        return errorData as T
      }

      if (!response.ok) {
        console.log('!response.ok')
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log({ data })
      return data as T
    } catch (error) {
      console.error('Error: ' + route)
      console.error({ error })
      return null
    }
  },

  ws: async <T = HttpResponse>(
    route: string,
    body: Record<string, unknown> = {},
  ): Promise<T | null> => {
    if (!WebSocketClient) return null

    try {
      const result = await WebSocketClient.api(route, body)
      console.log({ result })
      return result as unknown as T
    } catch (e) {
      console.error(e)
      return null
    }
  },
})

// // Создание экземпляра API
// const api = createApi('http://127.0.0.1:8088', new WebsocketBase('ws://127.0.0.1:8088'))

export default createApi
