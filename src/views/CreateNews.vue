<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

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

// Состояние формы
const newsContent = ref('')
const newsImages = ref<string[]>([])
const isLoading = ref(false)
const error = ref('')

// Проверка авторизации
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
  }
})

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
onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

// Вернуться назад
const backToNews = () => {
  router.push('/news')
}

// Переход в аккаунт
const goToAccount = () => {
  closeMenu()
  router.push('/account')
}

// Выход из аккаунта
const logout = () => {
  localStorage.removeItem('user')
  router.push('/')
}

// Функции для загрузки изображений
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  // Создаем URL для предпросмотра
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result === 'string') {
      newsImages.value.push(result)
    }
  }
  reader.readAsDataURL(file)
}

// Удаление изображения
const removeImage = (index: number) => {
  newsImages.value.splice(index, 1)
}

// Публикация новости
const postNews = () => {
  if (newsContent.value.trim() === '') {
    error.value = 'Please enter some content'
    return
  }

  isLoading.value = true
  error.value = ''

  // Имитация отправки на сервер
  setTimeout(() => {
    isLoading.value = false

    // Тут можно добавить логику для сохранения в localStorage или отправки на сервер

    // После успешной публикации переходим обратно к ленте новостей
    router.push('/news')
  }, 1500)
}
</script>

<template>
  <div class="create-news-page">
    <header class="create-news-header">
      <button class="back-button" @click="backToNews">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <span>Back to News</span>
      </button>
      <!-- <h1>Create News Post</h1> -->
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
    </header>

    <div class="create-news-content" :class="{ 'mobile-container': windowWidth <= 768 }">
      <div class="news-form">
        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="form-group">
          <label for="news-content">What's on your mind?</label>
          <textarea
            id="news-content"
            v-model="newsContent"
            class="content-input"
            placeholder="Share your thoughts..."
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Add Photos</label>
          <div class="image-upload-container">
            <label for="image-upload" class="image-upload-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path
                  d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"
                />
              </svg>
              <span>Upload Image</span>
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              class="image-input"
              @change="handleImageUpload"
            />
          </div>

          <!-- Preview of uploaded images -->
          <div v-if="newsImages.length > 0" class="image-previews">
            <div v-for="(image, index) in newsImages" :key="index" class="image-preview">
              <img :src="image" alt="Preview" />
              <button class="remove-image" @click="removeImage(index)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="publish-button" @click="postNews" :disabled="isLoading">
            <span v-if="isLoading">Publishing...</span>
            <span v-else>Publish</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-news-page {
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

.create-news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #1a73e8;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.create-news-header h1 {
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

.create-news-content {
  width: 100%;
  max-width: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(193, 201, 214, 0.5) transparent;
}

.create-news-content::-webkit-scrollbar {
  width: 3px;
}

.create-news-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.create-news-content::-webkit-scrollbar-thumb {
  background-color: rgba(193, 201, 214, 0.5);
  border-radius: 6px;
}

.create-news-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(168, 179, 195, 0.8);
}

.news-form {
  background-color: white;
  border-radius: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  max-width: 100%;
  width: 100%;
  margin: 0;
}

.error-message {
  background-color: #ffedee;
  color: #dc3545;
  padding: 12px;
  border-radius: 8px;
  margin: 0 20px 16px 20px;
  font-size: 14px;
  border-left: 4px solid #dc3545;
}

.form-group {
  margin-bottom: 24px;
  padding: 0 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #212529;
  font-size: 15px;
}

.content-input {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  font-size: 16px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.content-input:focus {
  border-color: #1a73e8;
  outline: none;
}

.image-upload-container {
  margin-bottom: 16px;
  width: 100%;
}

.image-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.image-upload-label:hover {
  background-color: #dee2e6;
  color: #212529;
}

.image-input {
  display: none;
}

.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #dc3545;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.remove-image:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px;
}

.publish-button {
  padding: 12px 28px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(26, 115, 232, 0.2);
}

.publish-button:hover:not(:disabled) {
  background-color: #1666d0;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(26, 115, 232, 0.25);
}

.publish-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(26, 115, 232, 0.2);
}

.publish-button:disabled {
  background-color: #99c2ff;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .create-news-header {
    padding: 15px 10px;
    flex-wrap: wrap;
    width: 100%;
    box-sizing: border-box;
  }

  .create-news-header h1 {
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

  .create-news-content {
    padding: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .mobile-container {
    width: 100%;
    padding: 0;
    margin: 0;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .create-news-page {
    width: 100%;
    overflow-x: hidden;
  }

  .news-form {
    padding: 16px;
    border-radius: 0;
    box-shadow: none;
    width: 100%;
    box-sizing: border-box;
  }

  .form-group {
    margin-bottom: 20px;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .error-message {
    margin: 0 0 16px 0;
    width: 100%;
    box-sizing: border-box;
  }

  .form-actions {
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .content-input {
    min-height: 100px;
    padding: 12px;
    font-size: 15px;
    width: 100%;
    border-radius: 8px;
    box-sizing: border-box;
  }

  .image-upload-container {
    width: 100%;
    margin-bottom: 16px;
    box-sizing: border-box;
  }

  .image-upload-label {
    display: flex;
    width: 100%;
    justify-content: center;
    padding: 12px;
    border-radius: 8px;
    box-sizing: border-box;
  }

  .image-previews {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .publish-button {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    border-radius: 8px;
    margin-top: 10px;
    box-sizing: border-box;
  }
}
</style>
