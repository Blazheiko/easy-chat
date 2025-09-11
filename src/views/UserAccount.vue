<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useStateStore } from '@/stores/state'
import { pushSubscriptionApi } from '@/utils/api'
// Глобальный хедер теперь рендерится в App.vue

defineOptions({
    name: 'UserAccount',
})

const userStore = useUserStore()
const stateStore = useStateStore()
const user = ref(userStore.user)

// Настройки и темы
const darkMode = ref(stateStore.darkMode)
const notificationsEnabled = ref(true)
const soundEnabled = ref(true)
const pushNotificationsEnabled = ref(stateStore.isSubscribedToPush)

// Загрузка данных пользователя из localStorage
// onMounted(() => {
//   const storedUser = localStorage.getItem('user')
//   if (storedUser) {
//     const parsedUser = JSON.parse(storedUser)
//     user.value = {
//       ...user.value,
//       id: parsedUser.id,
//       name: parsedUser.name,
//     }
//   } else {
//     // Если пользователь не авторизован, перенаправляем на страницу входа
//     router.push('/')
//   }
// })

// Функции для обновления настроек
function toggleDarkMode() {
    darkMode.value = !darkMode.value
    stateStore.setDarkMode(darkMode.value)
    console.log('Toggle dark mode:', darkMode.value) // Отладочная информация
}

const toggleNotifications = () => {
    notificationsEnabled.value = !notificationsEnabled.value
}

const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
}

const togglePushNotifications = async () => {
    try {
        if (!pushNotificationsEnabled.value) {
            // Переключатель выключен -> включаем push-уведомления
            // Сначала запрашиваем разрешение на уведомления
            const hasPermission = await stateStore.ensureNotificationPermission()
            if (!hasPermission) {
                console.warn('Пользователь не дал разрешение на уведомления')
                pushNotificationsEnabled.value = false
                return
            }

            // Подписываемся на push-уведомления
            const subscription = await stateStore.subscribeToPush()
            if (subscription) {
                console.log('✅ Успешно подписались на push-уведомления')

                // Отправляем уведомление на сервер о включении push-уведомлений
                try {
                    const clientIP = '127.0.0.1'
                    const browserInfo = getBrowserInfo()
                    const osInfo = getOSInfo()
                    await pushSubscriptionApi.createSubscription({
                        endpoint: subscription.endpoint,
                        p256dhKey: arrayBufferToBase64(subscription.getKey('p256dh')),
                        authKey: arrayBufferToBase64(subscription.getKey('auth')),
                        userAgent: navigator.userAgent,
                        ipAddress: clientIP || undefined,
                        deviceType: getDeviceType(),
                        browserName: browserInfo.name,
                        browserVersion: browserInfo.version,
                        osName: osInfo.name,
                        osVersion: osInfo.version,
                        notificationTypes: ['new_message', 'mention', 'system'], // Типы уведомлений по умолчанию
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    })
                } catch (notificationError) {
                    console.warn(
                        'Не удалось отправить уведомление о включении push:',
                        notificationError,
                    )
                    pushNotificationsEnabled.value = false
                }
            } else {
                console.error('❌ Не удалось подписаться на push-уведомления')
                console.info('💡 Возможные причины:')
                console.info('- VAPID ключ не настроен на сервере')
                console.info('- Браузер не поддерживает push-уведомления')
                console.info('- Сервер недоступен')

                // Возвращаем предыдущее состояние в случае ошибки
                pushNotificationsEnabled.value = false

                // Показываем пользователю понятное сообщение
                alert(
                    '❌ Не удалось включить push-уведомления.\n\nВозможные причины:\n• Сервер временно недоступен\n• Push-уведомления не настроены\n• Ваш браузер не поддерживает эту функцию',
                )
            }
        } else {
            // Переключатель включен -> отключаем push-уведомления
            const subscriptionId = stateStore.pushSubscriptionId
            const success = await stateStore.unsubscribeFromPush()
            if (success) {
                console.log('Успешно отписались от push-уведомлений')

                // Отправляем уведомление на сервер об отключении push-уведомлений
                try {

                    if (subscriptionId) {
                        await pushSubscriptionApi.deleteSubscription(subscriptionId)
                    }
                } catch (notificationError) {
                    console.warn(
                        'Не удалось отправить уведомление об отключении push:',
                        notificationError,
                    )
                }
            } else {
                console.error('Не удалось отписаться от push-уведомлений')
                // Возвращаем предыдущее состояние в случае ошибки
                pushNotificationsEnabled.value = true
            }
        }
    } catch (error) {
        console.error('Ошибка при переключении push-уведомлений:', error)
        // Возвращаем предыдущее состояние в случае ошибки
        pushNotificationsEnabled.value = !pushNotificationsEnabled.value
    }
}

// Вспомогательные функции для определения устройства и браузера
const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
        return 'mobile'
    }
    return 'desktop'
}

const getBrowserInfo = (): { name: string; version: string } => {
    const userAgent = navigator.userAgent
    const userAgentLower = userAgent.toLowerCase()

    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    if (userAgentLower.includes('chrome') && !userAgentLower.includes('edg')) {
        browserName = 'Chrome'
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgentLower.includes('firefox')) {
        browserName = 'Firefox'
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgentLower.includes('safari') && !userAgentLower.includes('chrome')) {
        browserName = 'Safari'
        const match = userAgent.match(/Version\/(\d+\.\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgentLower.includes('edg')) {
        browserName = 'Edge'
        const match = userAgent.match(/Edg\/(\d+\.\d+)/)
        browserVersion = match ? match[1] : 'Unknown'
    }

    return { name: browserName, version: browserVersion }
}

const getOSInfo = (): { name: string; version: string } => {
    const userAgent = navigator.userAgent

    let osName = 'Unknown'
    let osVersion = 'Unknown'

    if (userAgent.includes('Windows NT')) {
        osName = 'Windows'
        const match = userAgent.match(/Windows NT (\d+\.\d+)/)
        osVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('Mac OS X')) {
        osName = 'macOS'
        const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)
        osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown'
    } else if (userAgent.includes('Linux')) {
        osName = 'Linux'
        osVersion = 'Unknown'
    } else if (userAgent.includes('Android')) {
        osName = 'Android'
        const match = userAgent.match(/Android (\d+\.\d+)/)
        osVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        osName = 'iOS'
        const match = userAgent.match(/OS (\d+[._]\d+[._]?\d*)/)
        osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown'
    }

    return { name: osName, version: osVersion }
}

// Инициализация компонента
onMounted(() => {
    // Обновляем состояние push-уведомлений при загрузке
    pushNotificationsEnabled.value = stateStore.isSubscribedToPush
})

// Отслеживаем изменения в store
watch(
    () => stateStore.isSubscribedToPush,
    (newValue) => {
        pushNotificationsEnabled.value = newValue
    },
)

// Отслеживаем изменения разрешений на уведомления
watch(
    () => stateStore.notificationPermission,
    (newPermission) => {
        if (newPermission === 'denied' && pushNotificationsEnabled.value) {
            // Если разрешение отозвано, отключаем push-уведомления
            pushNotificationsEnabled.value = false
        }
    },
)
</script>

<template>
    <div class="account-page">
        <div class="account-content">
            <div class="profile-section">
                <div class="avatar-container">
                    <div class="avatar">{{ user?.name?.charAt(0) || 'U' }}</div>
                </div>
                <div class="user-info" v-if="user">
                    <h2>{{ user.name || 'User' }}</h2>
                    <p>{{ user.email || 'email@example.com' }}</p>
                    <p class="user-status">{{ user.status || 'Online' }}</p>
                    <p class="join-date">Member since: {{ user.createdAt }}</p>
                </div>
            </div>

            <div class="settings-section">
                <h3>Settings</h3>

                <div class="setting-item">
                    <div>
                        <h4>Dark Mode</h4>
                        <p>Enable dark theme for the app</p>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" :checked="darkMode" @change="toggleDarkMode" />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div>
                        <h4>Notifications</h4>
                        <p>Enable notifications for new messages</p>
                    </div>
                    <label class="toggle">
                        <input
                            type="checkbox"
                            v-model="notificationsEnabled"
                            @change="toggleNotifications"
                        />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div>
                        <h4>Sound</h4>
                        <p>Enable sound for notifications</p>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="soundEnabled" @change="toggleSound" />
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div>
                        <h4>Push Notifications</h4>
                        <p>Enable push notifications for new messages</p>
                        <div
                            class="setting-status"
                            v-if="stateStore.notificationPermission !== 'granted'"
                        >
                            <small class="permission-warning">
                                ⚠️ Browser permission required
                            </small>
                        </div>
                    </div>
                    <label class="toggle">
                        <input
                            type="checkbox"
                            v-model="pushNotificationsEnabled"
                            @change="togglePushNotifications"
                            :disabled="stateStore.notificationPermission === 'denied'"
                        />
                        <span
                            class="toggle-slider"
                            :class="{ disabled: stateStore.notificationPermission === 'denied' }"
                        ></span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-page {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
}

.dark-theme .account-page {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
    color: #e0e0e0;
}

.account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    background-color: var(--primary-color);
    color: white;
    box-shadow: var(--box-shadow);
    width: 100%;
}

.header-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dark-theme .account-header {
    background-color: #0d47a1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.account-header h1 {
    margin: 0;
    font-weight: 600;
    font-size: 24px;
}

.back-button,
.logout-button {
    padding: 8px 15px;
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
}

.back-button:hover,
.logout-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    transform: translateY(-1px);
}

.back-button:active,
.logout-button:active {
    transform: translateY(0);
    opacity: 0.9;
}

.account-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.profile-section {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    padding: 20px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark-theme .profile-section {
    background-color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.avatar-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.avatar {
    width: 110px;
    height: 110px;
    background-color: #1a73e8;
    background: linear-gradient(135deg, #1a73e8 0%, #6c92f4 100%);
    color: white;
    font-size: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3);
    font-weight: 500;
}

.user-info h2 {
    margin-top: 0;
    margin-bottom: 12px;
    color: #212529;
    font-weight: 600;
    font-size: 24px;
}

.dark-theme .user-info h2 {
    color: #e0e0e0;
}

.user-info p {
    margin: 5px 0;
    color: #6c757d;
    font-size: 15px;
}

.dark-theme .user-info p {
    color: #adb5bd;
}

.user-status {
    color: #28a745 !important;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
}

.user-status::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #28a745;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
}

.join-date {
    font-size: 14px;
    color: #adb5bd !important;
    margin-top: 10px !important;
}

.settings-section {
    background-color: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark-theme .settings-section {
    background-color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.settings-section h3 {
    margin-top: 0;
    margin-bottom: 25px;
    color: #212529;
    font-weight: 600;
    font-size: 20px;
}

.dark-theme .settings-section h3 {
    color: #e0e0e0;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dark-theme .setting-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-item h4 {
    margin: 0 0 5px 0;
    color: #212529;
    font-weight: 500;
    font-size: 16px;
}

.dark-theme .setting-item h4 {
    color: #e0e0e0;
}

.setting-item p {
    margin: 0;
    color: #6c757d;
    font-size: 14px;
}

.dark-theme .setting-item p {
    color: #adb5bd;
}

/* Toggle Switch */
.toggle {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 26px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #dee2e6;
    border-radius: 34px;
    transition: 0.4s;
}

.dark-theme .toggle-slider {
    background-color: #555;
}

.toggle-slider:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:checked + .toggle-slider {
    background-color: #1a73e8;
}

.dark-theme input:checked + .toggle-slider {
    background-color: #64b5f6;
}

input:checked + .toggle-slider:before {
    transform: translateX(26px);
}

input:focus + .toggle-slider {
    box-shadow: 0 0 1px #1a73e8;
}

/* Setting status and warnings */
.setting-status {
    margin-top: 8px;
}

.permission-warning {
    color: #f57c00;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}

.dark-theme .permission-warning {
    color: #ffb74d;
}

/* Disabled toggle */
.toggle-slider.disabled {
    background-color: #ccc !important;
    cursor: not-allowed;
}

.dark-theme .toggle-slider.disabled {
    background-color: #666 !important;
}

input:disabled + .toggle-slider {
    cursor: not-allowed;
    opacity: 0.6;
}

input:disabled + .toggle-slider:before {
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .account-header {
        padding: 16px 0;
    }

    .header-content {
        padding: 0 16px;
    }

    .account-content {
        padding: 16px;
    }

    .account-header h1 {
        order: -1;
        width: 100%;
        margin-bottom: 10px;
        text-align: center;
        font-size: 20px;
    }

    .back-button span,
    .logout-button span {
        display: none;
    }

    .back-button,
    .logout-button {
        padding: 8px;
        border-radius: 8px;
        justify-content: center;
    }

    .profile-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px;
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .toggle {
        align-self: flex-end;
    }
}
</style>
