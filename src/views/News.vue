<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NewsFeed from '../components/NewsFeed.vue'
import { defineComponent } from 'vue'

defineComponent({
    name: 'NewsView',
})

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
    // const storedUser = localStorage.getItem('user')
    // if (!storedUser) {
    //   router.push('/')
    // }
})

// Вернуться в чат
const backToChat = () => {
    router.push('/chat')
}

// Переход в манифест
const goToManifesto = () => {
    router.push('/manifesto')
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
                <!-- <h1>News Feed</h1> -->
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
                        <button class="menu-item" @click="goToManifesto">
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
                            Manifesto
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

.dark-theme .news-page {
    background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
}

.news-header {
    width: 100%;
    background-color: var(--primary-color);
    color: white;
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--box-shadow);
}

.dark-theme .news-header {
    background-color: #0d47a1;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.back-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.menu-container {
    position: relative;
}

.menu-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.menu-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.arrow-icon {
    transition: transform 0.3s ease;
}

.menu-button.open .arrow-icon {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    display: none;
    margin-top: 8px;
}

.dark-theme .dropdown-menu {
    background-color: #1e1e1e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown-menu.show {
    display: block;
    animation: menuFadeIn 0.2s ease;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: none;
    color: var(--text-color);
    font-size: 15px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
}

.dark-theme .menu-item {
    color: #e0e0e0;
}

.menu-item:hover {
    background-color: #f8f9fa;
}

.dark-theme .menu-item:hover {
    background-color: #2a2a2a;
}

.content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.content-container {
    max-width: 1400px;
    margin: 0 auto;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.dark-theme .content-container {
    background-color: #1e1e1e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@keyframes menuFadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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

.news-item {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 24px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.dark-theme .news-item {
    background-color: #1e1e1e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.news-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.dark-theme .news-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
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
    background-color: var(--primary-color);
    color: white;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3);
    font-weight: 500;
}

.dark-theme .user-avatar {
    background-color: #0d47a1;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    color: var(--text-color);
    font-size: 16px;
}

.dark-theme .user-name {
    color: #e0e0e0;
}

.post-time {
    color: #6c757d;
    font-size: 13px;
    margin-top: 2px;
}

.dark-theme .post-time {
    color: #adb5bd;
}

.news-item-content {
    padding: 0 20px 16px;
}

.news-item-content p {
    margin: 0 0 16px;
    line-height: 1.5;
    color: var(--text-color);
    font-size: 16px;
}

.dark-theme .news-item-content p {
    color: #e0e0e0;
}

.news-actions {
    display: flex;
    padding: 12px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    gap: 16px;
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
</style>
