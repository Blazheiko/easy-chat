interface WebsocketOptions {
  reconnectDelay?: number
}

interface WebsocketConnection {
  ws?: WebSocket
  closeInitiated?: boolean
  timerPing?: number
}

interface ApiResolveItem {
  resolve: (data: WebsocketMessage) => void
  reject: (error?: ApiError) => void
  timeout: number
}

interface WebsocketMessage {
  event: string
  status?: number
  payload?: {
    message?: string
    messages?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface ApiError {
  status?: number
  message?: string
  messages?: string[]
}

interface SendPayload {
  event: string
  payload?: Record<string, unknown>
}

class WebsocketBase {
  private reconnectDelay: number
  private wsConnection: WebsocketConnection
  private apiResolve: Record<string, ApiResolveItem>
  private connectionEstablished: boolean
  private timerClose?: number

  constructor(url: string, options: WebsocketOptions = {}) {
    this.reconnectDelay = options.reconnectDelay || 5000
    this.wsConnection = {}
    this.apiResolve = {}
    this.connectionEstablished = false
    this.initConnect(url)
  }

  isConnected(): boolean {
    return this.wsConnection.ws !== undefined && this.wsConnection.ws.readyState === WebSocket.OPEN
  }

  private initConnect(url: string): void {
    console.log(`Sending Websocket connection to: ${url}`)
    const ws = new WebSocket(url)
    console.log(`Sending Websocket connection to: ${url}`)
    this.wsConnection.ws = ws
    this.wsConnection.closeInitiated = false

    ws.onopen = (): void => {
      console.log(`Connected to the Websocket Server: ${url}`)
      this.wsConnection.timerPing = window.setInterval(() => {
        this.pingServer()
      }, 5000)
    }

    // handle data message. Pass the data to the call back method from user
    // It could be useful to store the original messages from server for debug
    ws.onmessage = (message: MessageEvent): void => {
      const data: WebsocketMessage = JSON.parse(message.data as string)
      if (!data || !data.event) {
        console.log('return')
        return
      }
      if (data.event.includes('service:')) this.service(data)
      else if (data.event.includes('api:')) {
        this.messageHandler(data)
      }
    }

    ws.onerror = (err: Event): void => {
      console.error('Received error from server')
      console.error(err)
    }

    ws.onclose = (event: CloseEvent): void => {
      if (!this.wsConnection.closeInitiated) {
        console.warn(`Connection close due to ${event.code}: ${event.reason}.`)
        window.setTimeout(() => {
          console.warn('Reconnect to the server.')
          this.initConnect(url)
        }, this.reconnectDelay)
      } else {
        this.wsConnection.closeInitiated = false
      }
    }
  }

  /**
   * Unsubscribe the stream
   */
  disconnect(): void {
    if (!this.isConnected()) console.warn('No connection to close.')
    else {
      this.wsConnection.closeInitiated = true
      if (this.wsConnection.ws) {
        this.wsConnection.ws.close()
      }
      if (this.wsConnection.timerPing) {
        window.clearInterval(this.wsConnection.timerPing)
      }
      console.log('Disconnected with Binance Websocket Server')
    }
  }

  /**
   * Send Ping message to the Websocket Server
   */
  pingServer(): void {
    if (!this.isConnected()) {
      console.warn('Ping only can be sent when connection is ready.')
      return
    }
    this.send({ event: 'service:ping' })
  }

  send(payload: SendPayload): void {
    if (!this.isConnected()) {
      console.warn('Send only can be sent when connection is ready.')
      return
    }
    if (this.timerClose) window.clearTimeout(this.timerClose)
    this.timerClose = window.setTimeout(() => {
      this.disconnect()
    }, 10000)
    if (this.wsConnection.ws) {
      this.wsConnection.ws.send(JSON.stringify(payload))
    }
  }

  async api(route: string, payload: Record<string, unknown> = {}): Promise<WebsocketMessage> {
    return new Promise((resolve, reject) => {
      if (this.apiResolve[route]) reject()
      this.send({
        event: `api:${route}`,
        payload,
      })
      this.apiResolve[route] = {
        resolve,
        reject,
        timeout: window.setTimeout(() => {
          reject()
        }, 10000),
      }
    })
  }

  private service(data: WebsocketMessage): void {
    const serviceHandlers: Record<string, () => void | boolean> = {
      pong: () => {
        if (this.timerClose) window.clearTimeout(this.timerClose)
      },
      connection_established: () => {
        this.connectionEstablished = true
        return this.connectionEstablished
      },
    }

    if (data && data.event) {
      const arr = data.event.split(':')
      if (arr.length < 2) return
      const handlerName = arr[1]
      const handler = serviceHandlers[handlerName]
      if (handler) handler()
    }
  }

  private messageHandler(data: WebsocketMessage): void {
    console.log('message handler')
    const arr = data.event.split(':')
    if (arr.length < 2) return
    const route = arr[1]
    const cb = this.apiResolve[route]
    if (!cb) return
    window.clearTimeout(cb.timeout)
    delete this.apiResolve[route]
    if (data.status === 200 && cb.resolve) cb.resolve(data)
    else if (cb.reject)
      cb.reject({
        status: data?.status,
        message: data?.payload?.message,
        messages: data?.payload?.messages,
      })
  }
}

export default WebsocketBase
