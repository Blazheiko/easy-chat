<script setup lang="ts">
import { ref } from 'vue'
import ContactsList from './components/ContactsList.vue'
import ChatArea from './components/ChatArea.vue'
import AuthModals from './components/AuthModals.vue'
import LoaderOverlay from './components/LoaderOverlay.vue'
import ConnectionStatus from './components/ConnectionStatus.vue'

const isContactsVisible = ref(false)
const isLoginModalVisible = ref(false)
const isRegisterModalVisible = ref(false)
const isLoading = ref(false)
const isOffline = ref(false)

const toggleContacts = () => {
  isContactsVisible.value = !isContactsVisible.value
}

const showLoginModal = () => {
  isLoginModalVisible.value = true
}

const showRegisterModal = () => {
  isRegisterModalVisible.value = true
}

const closeAuthModals = () => {
  isLoginModalVisible.value = false
  isRegisterModalVisible.value = false
}

const handleConnectionRetry = () => {
  isLoading.value = true

  // Имитация попытки переподключения
  setTimeout(() => {
    isLoading.value = false
    isOffline.value = false
  }, 2000)
}

// Проверяем состояние сети при загрузке и слушаем события
const setupNetworkListeners = () => {
  // Добавляем слушатели для отслеживания состояния сети
  window.addEventListener('online', () => {
    isOffline.value = false
  })

  window.addEventListener('offline', () => {
    isOffline.value = true
  })

  // Начальная проверка состояния сети
  isOffline.value = !navigator.onLine
}

// Вызываем функцию при монтировании компонента
setupNetworkListeners()
</script>

<template>
  <div class="chat-container">
    <ConnectionStatus :show="isOffline" @retry="handleConnectionRetry" />
    <LoaderOverlay :show="isLoading" />

    <ContactsList :class="{ show: isContactsVisible }" @toggle-contacts="toggleContacts" />
    <ChatArea
      @toggle-contacts="toggleContacts"
      @show-login="showLoginModal"
      @show-register="showRegisterModal"
    />
    <AuthModals
      :show-login="isLoginModalVisible"
      :show-register="isRegisterModalVisible"
      @close="closeAuthModals"
      @show-login="showLoginModal"
      @show-register="showRegisterModal"
    />
  </div>
</template>

<style>
:root {
  --primary-color: #003399;
  --background-color: #fff;
  --text-color: #333;
  --border-color: #ddd;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.5;
  min-height: 100vh;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  width: 100%;
  height: 100%;
  background-color: #fff;
  position: relative;
  margin: 0;
  flex: 1;
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }

  .contacts {
    position: fixed;
    left: -100%;
    top: 0;
    bottom: 0;
    width: 100%;
    max-width: 300px;
    transition: left 0.3s ease;
    z-index: 1000;
    background-color: #f5f5f5;
  }

  .contacts.show {
    left: 0;
  }
}

.auth-header-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-header-button:hover {
  background: #4338ca;
}
</style>
