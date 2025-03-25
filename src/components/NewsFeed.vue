<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Добавляем проп для управления отображением шапки
defineProps({
    hideHeader: {
        type: Boolean,
        default: false,
    },
})

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
        content:
            'Had an amazing day hiking in the mountains! The view was absolutely breathtaking.',
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
        content:
            "Thoughts on the new iPhone? Thinking about upgrading but not sure if it's worth it.",
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
        <!-- Шапка отображается только если hideHeader=false -->
        <div v-if="!hideHeader" class="news-header">
            <button class="back-to-chat-button" @click="$emit('back-to-chat')">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"
                    />
                </svg>
                <span>Back to Chat</span>
            </button>
            <h2>News Feed</h2>
            <button class="create-post-icon-button" @click="goToCreatePost" title="Create Post">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
            </button>
        </div>

        <div class="news-items-grid">
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
                        <div
                            v-for="(image, index) in item.images"
                            :key="index"
                            class="image-container"
                        >
                            <img
                                :src="image"
                                :alt="`${item.userName}'s post image ${index + 1}`"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                <div class="news-actions">
                    <button
                        class="action-button"
                        :class="{ liked: item.isLiked }"
                        @click="toggleLike(item)"
                    >
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
    gap: 16px;
    width: 100%;
    box-sizing: border-box;
    padding: 12px 12px 0;
}

.news-items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 16px;
    width: 100%;
    padding: 0;
}

.news-item {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.dark-theme .news-item {
    background-color: #242424;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid #3a3a3a;
}

.news-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.dark-theme .news-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    border-color: #444;
}

.news-item .news-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 10px;
    border-bottom: 1px solid #eaeaea;
    background-color: white;
}

.dark-theme .news-item .news-header {
    background-color: #242424;
    border-bottom: 1px solid #333;
}

.news-feed > .news-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--primary-color);
    color: white;
    justify-content: space-between;
}

.news-feed > .news-header h2 {
    flex: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
}

.back-to-chat-button {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: white;
    font-size: 14px;
    transition: opacity 0.2s;
}

.back-to-chat-button svg {
    width: 20px;
    height: 20px;
}

.back-to-chat-button:hover {
    opacity: 0.8;
}

.user-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #3b82f6 100%);
    color: white;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3);
    font-weight: 500;
    border: 2px solid white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;
}

.dark-theme .user-avatar {
    background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%);
    border-color: #333;
    box-shadow: 0 4px 10px rgba(13, 71, 161, 0.5);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* Добавляем светящийся эффект для лучшего визуального выделения */
.user-avatar::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    z-index: -1;
    background: transparent;
    box-shadow: 0 0 10px 2px rgba(26, 115, 232, 0.15);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.news-item:hover .user-avatar::after {
    opacity: 1;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    color: var(--text-color);
    font-size: 15px;
}

.dark-theme .news-item .user-name {
    color: #e0e0e0;
}

.post-time {
    color: #6c757d;
    font-size: 12px;
    margin-top: 1px;
}

.dark-theme .post-time {
    color: #adb5bd;
}

.news-content {
    padding: 0 16px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.news-content:hover {
    background-color: rgba(0, 0, 0, 0.01);
}

.news-content p {
    margin: 0 0 12px;
    line-height: 1.45;
    color: var(--text-color);
    font-size: 15px;
}

.dark-theme .news-content p {
    color: #e0e0e0;
}

.news-images {
    margin-top: auto;
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
    padding: 10px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    gap: 12px;
}

.dark-theme .news-actions {
    border-top-color: #333;
}

.action-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-color);
    padding: 8px 12px;
    border-radius: 20px;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
}

.dark-theme .action-button {
    color: #adb5bd;
}

.action-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--primary-color);
}

.dark-theme .action-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #64b5f6;
}

.action-button.liked {
    color: var(--primary-color);
}

.dark-theme .action-button.liked {
    color: #64b5f6;
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
    margin-bottom: 16px;
    width: 100%;
    box-sizing: border-box;
}

.load-more-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
    padding: 10px 20px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    width: 200px;
}

.dark-theme .load-more-button {
    background-color: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
}

.load-more-button:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
    transform: translateY(-1px);
}

.dark-theme .load-more-button:hover {
    background-color: #333;
    border-color: #555;
    transform: translateY(-1px);
}

.create-post-icon-button {
    background: transparent;
    border: none;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.create-post-icon-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.create-post-icon-button:active {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(1);
}

.create-post-icon-button svg {
    width: 24px;
    height: 24px;
}

.dark-theme .create-post-icon-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

.dark-theme .create-post-icon-button:active {
    background-color: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
    .news-feed {
        gap: 12px;
        width: 100%;
        max-width: 100%;
        padding: 8px 6px 0;
        margin: 0;
    }

    .news-items-grid {
        display: block;
        gap: 0;
        padding: 0;
    }

    .news-item {
        border-radius: 12px;
        margin-bottom: 12px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 100%;
        height: auto;
    }

    .dark-theme .news-item {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        border-top: 1px solid #3a3a3a;
        border-bottom: 1px solid #3a3a3a;
    }

    .news-item:hover {
        transform: none;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }

    .dark-theme .news-item:hover {
        transform: none;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .news-feed > .news-header {
        padding: 14px 16px;
    }

    .back-to-chat-button span {
        display: none;
    }

    .news-item .news-header {
        padding: 12px 16px;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        font-size: 18px;
        box-shadow: 0 2px 6px rgba(26, 115, 232, 0.25);
        border-width: 1.5px;
    }

    .news-content {
        padding: 0 16px 14px;
    }

    .news-content p {
        font-size: 15px;
        margin-bottom: 12px;
    }

    .news-images {
        border-radius: 8px;
        width: 100%;
    }

    .multi-image {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .news-actions {
        padding: 10px 16px;
    }

    .action-button {
        font-size: 13px;
        padding: 6px 8px;
    }

    .create-post-icon-button {
        width: 36px;
        height: 36px;
    }

    .create-post-icon-button svg {
        width: 20px;
        height: 20px;
    }

    .load-more {
        padding: 8px 16px 16px;
        margin: 0;
        width: 100%;
    }

    .load-more-button {
        width: 100%;
        border-radius: 8px;
        padding: 10px 16px;
        margin: 0;
    }
}
</style>
