import api from '@/utils/api'
import WebsocketBase from '@/utils/websocket-base'

/**
 * Композабл для инициализации данных приложения
 * Выполняет запрос на бэкенд для получения начальных данных
 */
export function useAppInitialization() {
    /**
     * Инициализирует данные приложения при загрузке
     */
    async function initializeApp() {
        try {
            const { data, error } = await api.http('GET', '/api/init')
            console.log(data)

            if (error ) {
                console.error('Error in initialization:', error)
                return null
            } else if (data && data.status === 'ok' && data.user && data.wsUrl) {
                const websocketBase = new WebsocketBase(data.wsUrl as string, {
                    callbacks: {
                        onReauthorize: async () => {
                            console.error('onReauthorize')
                            api.setWebSocketClient(null)
                            await initializeApp()
                        },
                    },
                })
                api.setWebSocketClient(websocketBase)
                return data
            } else if (data && data.status === 'unauthorized') {
                return null
            }
        } catch (error) {
            console.error('Error in initialization:', error)
        }

        return null
    }

    return {
        initializeApp,
    }
}
