<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStateStore } from '@/stores/state'

const stateStore = useStateStore()
const router = useRouter()

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

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside)
})

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
</script>

<template>
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
</template>

<style scoped>
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

.dark-theme .dropdown-menu {
    background-color: #1e1e1e;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
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

.dark-theme .menu-item {
    color: #e0e0e0;
}

.menu-item:last-child {
    color: #dc3545;
}

.dark-theme .menu-item:last-child {
    color: #ff6b6b;
}

.menu-item:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
}

.dark-theme .menu-item:hover {
    background-color: #333;
}

.menu-item:active {
    transform: translateY(0);
}
</style>
