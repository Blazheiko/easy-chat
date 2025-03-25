<script setup lang="ts">
import { useRouter } from 'vue-router'
import MenuButton from '@/components/MenuButton.vue'

// Props
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    backPath: {
        type: String,
        default: '',
    },
    backLabel: {
        type: String,
        default: 'Back',
    },
})

const router = useRouter()

// Вернуться назад
const goBack = () => {
    if (props.backPath) {
        router.push(props.backPath)
    } else {
        router.back()
    }
}
</script>

<template>
    <header class="app-header">
        <div class="header-content">
            <button v-if="backPath" class="back-button" @click="goBack">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>{{ backLabel }}</span>
            </button>
            <h1 v-if="title">{{ title }}</h1>
            <div v-else class="title-slot"><slot name="title"></slot></div>
            <MenuButton />
        </div>
    </header>
</template>

<style scoped>
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    background-color: var(--primary-color);
    color: white;
    box-shadow: var(--box-shadow);
    width: 100%;
}

.dark-theme .app-header {
    background-color: #0d47a1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.app-header h1 {
    margin: 0;
    font-weight: 600;
    font-size: 24px;
}

.title-slot {
    flex: 1;
    text-align: center;
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

@media (max-width: 768px) {
    .app-header {
        padding: 12px 0;
    }

    .header-content {
        padding: 0 16px;
    }

    .app-header h1 {
        font-size: 20px;
    }

    .back-button {
        padding: 6px 12px;
        font-size: 13px;
    }

    .back-button span {
        display: none;
    }
}
</style>
