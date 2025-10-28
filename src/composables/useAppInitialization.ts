import baseApi from '@/utils/base-api'
import WebsocketBase from '@/utils/websocket-base'


export function useAppInitialization() {

    async function initializeApp() {
        try {
            const { data, error } = await baseApi.http('GET', '/api/main/init')
            console.log(data)

            if (error ) {
                console.error('Error in initialization:', error)
                return null
            } else if (data && data.status === 'ok' && data.user && data.wsUrl) {
                const websocketBase = new WebsocketBase(data.wsUrl as string, {
                    callbacks: {
                        onReauthorize: async () => {
                            console.error('onReauthorize')
                            baseApi.setWebSocketClient(null)
                            setTimeout(async () => {
                                await initializeApp()
                            }, 1000)
                        },
                    },
                })
                baseApi.setWebSocketClient(websocketBase)
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
