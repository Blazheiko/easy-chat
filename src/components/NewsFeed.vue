<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface NewsItem {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  content: string
  images?: string[]
  likes: number
  comments: number
  timeAgo: string
  isLiked?: boolean
}

// Демонстрационные данные
const newsItems = ref<NewsItem[]>([
  {
    id: 1,
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
  },
  {
    id: 2,
    userId: 2,
    userName: 'Mary Johnson',
    content: 'Just finished reading this amazing book. Highly recommend it to everyone!',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    ],
    likes: 16,
    comments: 3,
    timeAgo: '5 hours ago',
  },
  {
    id: 3,
    userId: 3,
    userName: 'Alex Wilson',
    content: 'Just got a new job at Google! So excited to start this new chapter in my life.',
    likes: 42,
    comments: 12,
    timeAgo: '1 day ago',
  },
  {
    id: 4,
    userId: 4,
    userName: 'Helen Brown',
    content:
      'Had a wonderful dinner with friends last night at the new Italian restaurant downtown. The pasta was incredible!',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    ],
    likes: 31,
    comments: 8,
    timeAgo: '1 day ago',
  },
  {
    id: 5,
    userId: 5,
    userName: 'James Wilson',
    content: "Thoughts on the new iPhone? Thinking about upgrading but not sure if it's worth it.",
    likes: 7,
    comments: 15,
    timeAgo: '2 days ago',
  },
  {
    id: 6,
    userId: 6,
    userName: 'Sarah Parker',
    content:
      'Just came back from my trip to Japan! Here are some pictures from Tokyo and Kyoto. The culture, food, and people were amazing!',
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    ],
    likes: 64,
    comments: 23,
    timeAgo: '3 days ago',
  },
  {
    id: 7,
    userId: 7,
    userName: 'Michael Chen',
    content:
      'Just completed my first marathon! It was tough but so rewarding. Thanks to everyone who supported me along the way.',
    images: [
      'https://images.unsplash.com/photo-1530137073414-caacf9d82710?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    ],
    likes: 89,
    comments: 31,
    timeAgo: '5 days ago',
  },
])

// Функция для лайка новости
const toggleLike = (newsItem: NewsItem) => {
  if (newsItem.isLiked) {
    newsItem.likes--
    newsItem.isLiked = false
  } else {
    newsItem.likes++
    newsItem.isLiked = true
  }
}

// Получаем первую букву имени пользователя для аватара
const getInitial = (name: string): string => {
  return name.charAt(0)
}

// Добавляем функцию для перехода к детальному просмотру
const router = useRouter()

const viewNewsDetail = (newsId: number) => {
  router.push(`/news/${newsId}`)
}

const goToCreatePost = () => {
  router.push('/news/create')
}
</script>

<template>
  <div class="news-feed">
    <div class="create-post-button-container">
      <button class="create-post-button" @click="goToCreatePost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Create Post
      </button>
    </div>

    <div class="news-item" v-for="item in newsItems" :key="item.id">
      <div class="news-header">
        <div class="user-avatar">{{ getInitial(item.userName) }}</div>
        <div class="user-info">
          <div class="user-name">{{ item.userName }}</div>
          <div class="post-time">{{ item.timeAgo }}</div>
        </div>
      </div>

      <div class="news-content" @click="viewNewsDetail(item.id)">
        <p>{{ item.content }}</p>

        <div
          v-if="item.images && item.images.length > 0"
          class="news-images"
          :class="{
            'single-image': item.images.length === 1,
            'multi-image': item.images.length > 1,
          }"
        >
          <div v-for="(image, index) in item.images" :key="index" class="image-container">
            <img :src="image" :alt="`${item.userName}'s post image ${index + 1}`" loading="lazy" />
          </div>
        </div>
      </div>

      <div class="news-actions">
        <button class="action-button" :class="{ liked: item.isLiked }" @click="toggleLike(item)">
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
          <span>{{ item.likes }}</span>
        </button>

        <button class="action-button" @click="viewNewsDetail(item.id)">
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
          <span>{{ item.comments }}</span>
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

    <div class="load-more">
      <button class="load-more-button">Load More</button>
    </div>
  </div>
</template>

<style scoped>
.news-feed {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.news-item {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.news-header {
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

.news-content {
  padding: 0 20px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.news-content:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.news-content p {
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

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.load-more-button {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.load-more-button:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
  transform: translateY(-1px);
}

.create-post-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.create-post-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
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

.create-post-button:hover {
  background-color: #1666d0;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(26, 115, 232, 0.25);
}

.create-post-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(26, 115, 232, 0.2);
}

@media (max-width: 768px) {
  .news-feed {
    padding-right: 0;
    width: 100%;
    gap: 16px;
  }

  .news-item {
    border-radius: 12px;
    width: 100%;
    margin: 0;
  }

  .news-header {
    padding: 14px 12px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .news-content {
    padding: 0 12px 14px;
  }

  .news-content p {
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

  .image-container {
    border-radius: 6px;
  }

  .load-more {
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .create-post-button {
    width: 90%;
    justify-content: center;
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
