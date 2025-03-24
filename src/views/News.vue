<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NewsFeed from '../components/NewsFeed.vue'

const router = useRouter()

// Отслеживание ширины окна
const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Проверка авторизации
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
  }
})

// Вернуться в чат
const backToChat = () => {
  router.push('/chat')
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

// Состояние меню
const isMenuOpen = ref(false)

// Управление меню
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Обработчик клика вне меню
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (isMenuOpen.value && !target.closest('.menu-container')) {
    closeMenu()
  }
}

// Добавляем обработчик клика вне меню
window.addEventListener('click', handleClickOutside)
</script>

<template>
  <div class="news-page">
    <header class="news-header">
      <div class="header-content">
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
        <h1>News Feed</h1>
        <div class="menu-container">
          <button class="menu-button" @click.stop="toggleMenu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="white"
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
              fill="white"
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
            <button class="menu-item" @click="logout">
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
    </header>

    <div class="content-wrapper">
      <div class="content-container">
        <NewsFeed />
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-page {
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.news-header {
  width: 100%;
  background-color: #1a73e8;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  max-width: 1400px; /* Широкий контейнер для большего использования пространства */
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c1c9d6 transparent;
  width: 100%;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 1400px; /* Тот же размер, что и у шапки */
  padding: 24px;
  box-sizing: border-box;
}

.news-header h1 {
  margin: 0;
  font-weight: 600;
  font-size: 24px;
}

.back-button {
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

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-1px);
}

.back-button:active {
  transform: translateY(0);
  opacity: 0.9;
}

.menu-container {
  position: relative;
}

.menu-button {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-1px);
}

.menu-button:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(0);
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
  color: #212529;
  border-radius: 8px;
  margin: 4px 8px;
  width: calc(100% - 16px);
  font-weight: 500;
  font-size: 14px;
}

.menu-item:last-child {
  color: #dc3545;
}

.menu-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

.menu-item:active {
  transform: translateY(0);
}

.content-wrapper::-webkit-scrollbar {
  width: 3px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(193, 201, 214, 0.5);
  border-radius: 6px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(168, 179, 195, 0.8);
}

@media (max-width: 768px) {
  .news-page {
    overflow-x: hidden;
  }

  .news-header {
    width: 100%;
  }

  .header-content {
    flex-wrap: wrap;
    padding: 15px 10px;
  }

  .news-header h1 {
    order: -1;
    width: 100%;
    margin-bottom: 10px;
    text-align: center;
    font-size: 20px;
  }

  .back-button span {
    display: none;
  }

  .back-button {
    padding: 8px;
    border-radius: 8px;
    justify-content: center;
  }

  .menu-button span {
    display: none;
  }

  .arrow-icon {
    display: none;
  }

  .content-container {
    padding: 0;
  }

  .content-wrapper::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  .content-wrapper {
    -ms-overflow-style: none; /* IE и Edge */
    scrollbar-width: none; /* Firefox */
  }
}

@media (min-width: 768px) and (max-width: 1200px) {
  .header-content,
  .content-container {
    max-width: 1000px;
  }
}
</style>
