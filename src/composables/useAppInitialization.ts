import api from '@/utils/api'

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

            if (error) {
                console.error('Error in initialization:', error)
                return null
            }
            if (data && data.status === 'ok' && data.user) {
                return data
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
