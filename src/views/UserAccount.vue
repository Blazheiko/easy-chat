<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useStateStore } from '@/stores/state'
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
</script>

<template>
    <div class="account-page">
        <div class="account-content">
            <div class="profile-section">
                <div class="avatar-container">
                    <div class="avatar">{{ user.name?.charAt(0) || 'U' }}</div>
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
