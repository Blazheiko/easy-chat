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
            const data = await api.http('GET', '/api/initialize')

            if (data) {
                console.log('Данные успешно инициализированы', data)
                return data
            }
        } catch (error) {
            console.error('Произошла ошибка при инициализации:', error)
        }
    }

    return {
        initializeApp,
    }
}
