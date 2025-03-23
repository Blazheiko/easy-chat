<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import ContactsList from '../components/ContactsList.vue'
import ChatArea from '../components/ChatArea.vue'
import LoaderOverlay from '../components/LoaderOverlay.vue'
import ConnectionStatus from '../components/ConnectionStatus.vue'

defineComponent({
  name: 'ChatView',
})

const router = useRouter()
const isContactsVisible = ref(false)
const isLoading = ref(false)
const isOffline = ref(false)

const toggleContacts = () => {
  isContactsVisible.value = !isContactsVisible.value
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

// Переход в аккаунт
const goToAccount = () => {
  router.push('/account')
}

// Выход из аккаунта
const logout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

// Вызываем функцию при монтировании компонента
setupNetworkListeners()
</script>

<template>
  <div class="chat-container">
    <ConnectionStatus :show="isOffline" @retry="handleConnectionRetry" />
    <LoaderOverlay :show="isLoading" />

    <ContactsList :class="{ show: isContactsVisible }" @toggle-contacts="toggleContacts" />
    <div class="main-content">
      <ChatArea @toggle-contacts="toggleContacts" @go-to-account="goToAccount" @logout="logout" />
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  position: relative;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
  }
}
</style>
