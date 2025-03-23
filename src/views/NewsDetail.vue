<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const newsId = ref(parseInt(route.params.id as string))

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

// Новость
const newsItem = ref({
  id: newsId.value,
  userId: 1,
  userName: 'John Smith',
  content: 'Had an amazing day hiking in the mountains! The view was absolutely breathtaking.',
  images: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  ],
  likes: 24,
  comments: 6,
  timeAgo: '2 hours ago',
  isLiked: false,
})

// Комментарии
const comments = ref([
  {
    id: 1,
    userId: 2,
    userName: 'Alex Wilson',
    content: 'Amazing view! Where exactly is this?',
    timeAgo: '1 hour ago',
    likes: 3,
  },
  {
    id: 2,
    userId: 3,
    userName: 'Sarah Parker',
    content: 'I was there last summer! One of the best hiking trails in the area.',
    timeAgo: '45 minutes ago',
    likes: 2,
  },
  {
    id: 3,
    userId: 4,
    userName: 'Michael Chen',
    content: 'The colors in that sunset photo are incredible. What camera did you use?',
    timeAgo: '30 minutes ago',
    likes: 1,
  },
])

// Новый комментарий
const newComment = ref('')

// Функция добавления комментария
const addComment = () => {
  if (newComment.value.trim() === '') return

  const comment = {
    id: comments.value.length + 1,
    userId: 5,
    userName: 'Current User',
    content: newComment.value,
    timeAgo: 'Just now',
    likes: 0,
  }

  comments.value.push(comment)
  newComment.value = ''
}

// Функция лайка новости
const toggleLike = () => {
  if (newsItem.value.isLiked) {
    newsItem.value.likes--
    newsItem.value.isLiked = false
  } else {
    newsItem.value.likes++
    newsItem.value.isLiked = true
  }
}

// Вернуться к ленте новостей
const backToNews = () => {
  router.push('/news')
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

// Получаем первую букву имени пользователя для аватара
const getInitial = (name: string): string => {
  return name.charAt(0)
}

// Проверка авторизации
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
  }

  // Добавляем обработчик клика вне меню
  window.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="news-detail-page">
    <header class="news-header">
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
      <h1>News Detail</h1>
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

    <div class="detail-content">
      <!-- Новость -->
      <div class="news-item">
        <div class="news-item-header">
          <div class="user-avatar">{{ getInitial(newsItem.userName) }}</div>
          <div class="user-info">
            <div class="user-name">{{ newsItem.userName }}</div>
            <div class="post-time">{{ newsItem.timeAgo }}</div>
          </div>
        </div>

        <div class="news-item-content">
          <p>{{ newsItem.content }}</p>

          <div
            v-if="newsItem.images && newsItem.images.length > 0"
            class="news-images"
            :class="{
              'single-image': newsItem.images.length === 1,
              'multi-image': newsItem.images.length > 1,
            }"
          >
            <div v-for="(image, index) in newsItem.images" :key="index" class="image-container">
              <img
                :src="image"
                :alt="`${newsItem.userName}'s post image ${index + 1}`"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div class="news-actions">
          <button class="action-button" :class="{ liked: newsItem.isLiked }" @click="toggleLike">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <span>{{ newsItem.likes }}</span>
          </button>

          <button class="action-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
              />
            </svg>
            <span>{{ comments.length }}</span>
          </button>

          <button class="action-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path
                d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
              />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      <!-- Секция комментариев -->
      <div class="comments-section">
        <h2>Discussion ({{ comments.length }})</h2>

        <!-- Форма добавления комментария -->
        <div class="comment-form">
          <div class="user-avatar current">{{ getInitial('Current User') }}</div>
          <div class="comment-input-container">
            <textarea
              v-model="newComment"
              placeholder="Write a comment..."
              class="comment-input"
              @keyup.enter="addComment"
            ></textarea>
            <button class="post-button" @click="addComment" :disabled="!newComment.trim()">
              Post
            </button>
          </div>
        </div>

        <!-- Список комментариев -->
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <div class="user-avatar">{{ getInitial(comment.userName) }}</div>
              <div class="comment-info">
                <div class="comment-user-name">{{ comment.userName }}</div>
                <div class="comment-time">{{ comment.timeAgo }}</div>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
            <div class="comment-actions">
              <button class="comment-action">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                <span>{{ comment.likes }}</span>
              </button>
              <button class="comment-action">Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-detail-page {
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
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #1a73e8;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
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

.detail-content {
  width: 100%;
  max-width: 100%;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(193, 201, 214, 0.5) transparent;
}

.detail-content::-webkit-scrollbar {
  width: 3px;
}

.detail-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.detail-content::-webkit-scrollbar-thumb {
  background-color: rgba(193, 201, 214, 0.5);
  border-radius: 6px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(168, 179, 195, 0.8);
}

.news-item {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 20px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.news-item-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background-color: #1a73e8;
  background: linear-gradient(135deg, #1a73e8 0%, #6c92f4 100%);
  color: white;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3);
  font-weight: 500;
}

.user-avatar.current {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #212529;
  font-size: 16px;
}

.post-time {
  color: #6c757d;
  font-size: 13px;
  margin-top: 2px;
}

.news-item-content {
  padding: 0 20px 16px;
}

.news-item-content p {
  margin: 0 0 16px;
  line-height: 1.5;
  color: #212529;
  font-size: 16px;
}

.news-images {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.single-image .image-container {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
}

.multi-image {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.image-container {
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 16/9;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-container:hover img {
  transform: scale(1.03);
}

.news-actions {
  display: flex;
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  gap: 16px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.action-button:hover {
  background-color: rgba(108, 117, 125, 0.1);
  color: #212529;
}

.action-button.liked {
  color: #e41e3f;
}

.action-button svg {
  opacity: 0.8;
}

.action-button:hover svg {
  opacity: 1;
}

/* Комментарии */
.comments-section {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin: 0 20px 20px 20px;
}

.comments-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #212529;
}

.comment-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-input {
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  font-size: 15px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.comment-input:focus {
  border-color: #1a73e8;
  outline: none;
}

.post-button {
  align-self: flex-end;
  padding: 8px 24px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.post-button:hover {
  background-color: #1666d0;
  transform: translateY(-1px);
}

.post-button:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  transform: none;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  border-radius: 12px;
  background-color: #f8f9fa;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.comment-info {
  display: flex;
  flex-direction: column;
}

.comment-user-name {
  font-weight: 600;
  color: #212529;
  font-size: 15px;
}

.comment-time {
  color: #6c757d;
  font-size: 12px;
  margin-top: 2px;
}

.comment-content {
  font-size: 15px;
  line-height: 1.5;
  color: #212529;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.comment-action {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  padding: 6px 10px;
  border-radius: 16px;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.comment-action:hover {
  background-color: rgba(108, 117, 125, 0.1);
  color: #212529;
}

@media (min-width: 769px) and (max-width: 1024px) {
  .news-item,
  .comments-section {
    margin: 15px;
  }

  .comments-section {
    margin-bottom: 15px;
  }
}

@media (max-width: 768px) {
  .news-header {
    padding: 15px 10px;
    flex-wrap: wrap;
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

  .detail-content {
    padding: 10px 0;
    max-width: 100%;
    margin: 0;
  }

  .detail-content::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  .detail-content {
    -ms-overflow-style: none; /* IE и Edge */
    scrollbar-width: none; /* Firefox */
  }

  .news-item {
    border-radius: 12px;
    width: calc(100% - 20px);
    margin: 10px;
  }

  .news-item-header {
    padding: 14px 12px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .news-item-content {
    padding: 0 12px 14px;
  }

  .news-item-content p {
    font-size: 15px;
    margin: 0 0 12px;
  }

  .news-actions {
    padding: 10px 12px;
  }

  .action-button {
    font-size: 13px;
    padding: 6px 8px;
  }

  .multi-image {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .comment-form {
    flex-direction: column;
    gap: 12px;
  }

  .user-avatar.current {
    align-self: flex-start;
  }

  .comment-input {
    min-height: 60px;
  }

  .post-button {
    width: 100%;
  }

  .comments-section {
    border-radius: 12px;
    padding: 16px 12px;
    margin: 10px;
  }

  .comments-section h2 {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .comment-form {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .comment-item {
    padding: 14px 12px;
  }
}
</style>
