<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref({
  id: 0,
  name: '',
  email: 'user@example.com',
  joinDate: '01/01/2023',
  avatar: '',
  status: 'Online',
})

// Настройки и темы
const darkMode = ref(false)
const notificationsEnabled = ref(true)
const soundEnabled = ref(true)

// Загрузка данных пользователя из localStorage
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser)
    user.value = {
      ...user.value,
      id: parsedUser.id,
      name: parsedUser.name,
    }
  } else {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    router.push('/')
  }
})

// Выход из аккаунта
const logout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

// Вернуться в чат
const backToChat = () => {
  router.push('/chat')
}

// Функции для обновления настроек
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  // Здесь можно добавить логику для применения темной темы
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
    <header class="account-header">
      <button class="back-button" @click="backToChat">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <span>Back to Chat</span>
      </button>
      <h1>Account Settings</h1>
      <button class="logout-button" @click="logout">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path
            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
          />
        </svg>
        <span>Logout</span>
      </button>
    </header>

    <div class="account-content">
      <div class="profile-section">
        <div class="avatar-container">
          <div class="avatar">{{ user.name.charAt(0) }}</div>
        </div>
        <div class="user-info">
          <h2>{{ user.name }}</h2>
          <p>{{ user.email }}</p>
          <p class="user-status">{{ user.status }}</p>
          <p class="join-date">Member since: {{ user.joinDate }}</p>
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
            <input type="checkbox" v-model="darkMode" @change="toggleDarkMode" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div>
            <h4>Notifications</h4>
            <p>Enable notifications for new messages</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="notificationsEnabled" @change="toggleNotifications" />
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
  background-color: #f5f5f5;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #003399;
  color: white;
}

.account-header h1 {
  margin: 0;
}

.back-button,
.logout-button {
  padding: 8px 15px;
  background-color: transparent;
  border: 2px solid white;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-button:hover,
.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.back-button:active,
.logout-button:active {
  transform: scale(0.98);
}

.account-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-section {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  background-color: #003399;
  color: white;
  font-size: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.user-info h2 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.user-info p {
  margin: 5px 0;
  color: #666;
}

.user-status {
  color: #4caf50 !important;
  font-weight: bold;
}

.join-date {
  font-size: 14px;
  color: #999 !important;
}

.settings-section {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.setting-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
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
  background-color: #ccc;
  border-radius: 34px;
  transition: 0.4s;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
}

input:checked + .toggle-slider {
  background-color: #003399;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .account-header {
    padding: 15px;
    flex-wrap: wrap;
  }

  .account-header h1 {
    order: -1;
    width: 100%;
    margin-bottom: 10px;
    text-align: center;
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
