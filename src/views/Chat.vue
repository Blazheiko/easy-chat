<script setup lang="ts">
import { ref, defineComponent, onMounted, onBeforeUnmount } from 'vue'
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
const isMenuOpen = ref(false)

const toggleContacts = () => {
  isContactsVisible.value = !isContactsVisible.value
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
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

// Функция для закрытия выпадающего меню при клике вне
const closeMenuOnClickOutside = (event: MouseEvent) => {
  if (isMenuOpen.value) {
    const target = event.target as HTMLElement
    const menu = document.querySelector('.dropdown-menu')
    const menuButton = document.querySelector('.menu-button')

    if (menu && menuButton && !menu.contains(target) && !menuButton.contains(target)) {
      isMenuOpen.value = false
    }
  }
}

// Переход в аккаунт
const goToAccount = () => {
  isMenuOpen.value = false
  router.push('/account')
}

// Переход на страницу новостей
const goToNews = () => {
  isMenuOpen.value = false
  router.push('/news')
}

// Выход из аккаунта
const logout = () => {
  isMenuOpen.value = false
  localStorage.removeItem('user')
  router.push('/')
}

onMounted(() => {
  setupNetworkListeners()
  document.addEventListener('click', closeMenuOnClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
  <div class="chat-container">
    <ConnectionStatus :show="isOffline" @retry="handleConnectionRetry" />
    <LoaderOverlay :show="isLoading" />

    <div class="chat-header">
      <button class="contact-toggle" @click="toggleContacts">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
        <span>Contacts</span>
      </button>

      <h1>Easy Chat</h1>

      <div class="menu-container">
        <button class="menu-button" @click.stop="toggleMenu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span>Menu</span>
          <svg
            class="arrow-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        <div class="dropdown-menu" :class="{ show: isMenuOpen }">
          <button class="menu-item" @click="goToAccount">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            My Account
          </button>
          <button class="menu-item" @click="goToNews">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M19 5v14H5V5h14m1-2H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-5 4h-3v2h3V7zm0 4h-3v2h3v-2zm0 4h-3v2h3v-2zM7 7h5v2H7V7zm0 4h5v2H7v-2zm0 4h5v2H7v-2z"
              />
            </svg>
            News Feed
          </button>
          <button class="menu-item logout" @click="logout">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <ContactsList :class="{ show: isContactsVisible }" @toggle-contacts="toggleContacts" />
      <div class="main-content">
        <ChatArea
          @toggle-contacts="toggleContacts"
          @go-to-account="goToAccount"
          @go-to-news="goToNews"
          @logout="logout"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--background-color);
  position: relative;
  overflow: hidden;
}

.chat-header {
  height: var(--header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: var(--primary-color);
  color: white;
  box-shadow: var(--box-shadow);
}

.chat-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.chat-main {
  display: grid;
  grid-template-columns: 300px 1fr;
  flex: 1;
  height: calc(100% - var(--header-height));
  overflow: hidden;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.contact-toggle,
.menu-button {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 8px 15px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.contact-toggle:hover,
.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-1px);
}

.contact-toggle:active,
.menu-button:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(0);
}

.menu-container {
  position: relative;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.menu-button.open .arrow-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 200px;
  background-color: white;
  border: none;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  padding: 6px 0;
}

.dropdown-menu.show {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 12px 15px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-color);
  border-radius: 8px;
  margin: 4px 8px;
  width: calc(100% - 16px);
  font-weight: 500;
  font-size: 14px;
}

.menu-item.logout {
  color: #dc3545;
}

.menu-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

.menu-item:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .chat-header {
    padding: 0 16px;
  }

  .chat-header h1 {
    font-size: 18px;
  }

  .contact-toggle span,
  .menu-button span,
  .arrow-icon {
    display: none;
  }

  .contact-toggle,
  .menu-button {
    padding: 10px;
    justify-content: center;
  }

  .chat-main {
    grid-template-columns: 1fr;
  }

  :deep(.contacts-list) {
    position: absolute;
    top: var(--header-height);
    left: -100%;
    width: 100%;
    height: calc(100% - var(--header-height));
    z-index: 10;
    transition: all 0.3s ease;
  }

  :deep(.contacts-list.show) {
    left: 0;
  }
}
</style>
