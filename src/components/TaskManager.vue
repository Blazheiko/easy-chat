<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Task {
    id: number
    title: string
    createdAt: Date
    assignees: string[]
    progress: number
    status: 'pending' | 'in-progress' | 'completed'
}

const emit = defineEmits(['toggle-contacts'])

const tasks = ref<Task[]>([
    {
        id: 1,
        title: 'Fix notification bug',
        createdAt: new Date('2024-01-15T10:30:00'),
        assignees: ['JD', 'AS'],
        progress: 75,
        status: 'in-progress',
    },
    {
        id: 2,
        title: 'Add dark theme',
        createdAt: new Date('2024-01-14T14:20:00'),
        assignees: ['MB', 'JD'],
        progress: 100,
        status: 'completed',
    },
    {
        id: 3,
        title: 'Optimize performance',
        createdAt: new Date('2024-01-16T09:15:00'),
        assignees: ['AS'],
        progress: 30,
        status: 'in-progress',
    },
    {
        id: 4,
        title: 'Write documentation',
        createdAt: new Date('2024-01-17T11:45:00'),
        assignees: ['MB'],
        progress: 0,
        status: 'pending',
    },
])

const newTaskTitle = ref('')
const showCreateForm = ref(false)

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'completed':
            return '#4caf50'
        case 'in-progress':
            return '#ff9800'
        case 'pending':
            return '#9e9e9e'
        default:
            return '#9e9e9e'
    }
}

const getStatusText = (status: string): string => {
    switch (status) {
        case 'completed':
            return 'Completed'
        case 'in-progress':
            return 'In Progress'
        case 'pending':
            return 'Pending'
        default:
            return 'Unknown'
    }
}

const createTask = () => {
    if (newTaskTitle.value.trim()) {
        const newTask: Task = {
            id: Date.now(),
            title: newTaskTitle.value.trim(),
            createdAt: new Date(),
            assignees: ['ME'],
            progress: 0,
            status: 'pending',
        }
        tasks.value.unshift(newTask)
        newTaskTitle.value = ''
        showCreateForm.value = false
    }
}

const updateProgress = (taskId: number, progress: number) => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
        task.progress = progress
        if (progress === 100) {
            task.status = 'completed'
        } else if (progress > 0) {
            task.status = 'in-progress'
        } else {
            task.status = 'pending'
        }
    }
}

const deleteTask = (taskId: number) => {
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
}

// Calculate circumference for circular progress bar
const circumference = 2 * Math.PI * 45 // radius 45

onMounted(() => {
    // Can load tasks from localStorage or API
})
</script>

<template>
    <div class="task-manager">
        <div class="task-header">
            <button @click="emit('toggle-contacts')" class="back-button">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
            <h2>Task Manager</h2>
            <button @click="showCreateForm = !showCreateForm" class="create-task-button">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>

        <div class="task-content">
            <!-- Task creation form -->
            <div v-if="showCreateForm" class="create-task-form">
                <input
                    v-model="newTaskTitle"
                    type="text"
                    placeholder="Enter task title..."
                    class="task-input"
                    @keyup.enter="createTask"
                    @keyup.esc="showCreateForm = false"
                />
                <div class="form-actions">
                    <button @click="createTask" class="btn-primary">Create</button>
                    <button @click="showCreateForm = false" class="btn-secondary">Cancel</button>
                </div>
            </div>

            <!-- Tasks list -->
            <div class="tasks-list">
                <div v-if="tasks.length === 0" class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    <p>No tasks</p>
                    <small>Create your first task by clicking the "+" button</small>
                </div>

                <div v-for="task in tasks" :key="task.id" class="task-item">
                    <div class="task-main">
                        <div class="task-info">
                            <h4 class="task-title">{{ task.title }}</h4>
                            <p class="task-date">{{ formatDate(task.createdAt) }}</p>
                        </div>

                        <div class="task-assignees">
                            <div
                                v-for="assignee in task.assignees"
                                :key="assignee"
                                class="assignee-avatar"
                                :title="assignee"
                            >
                                {{ assignee }}
                            </div>
                        </div>
                    </div>

                    <div class="task-progress">
                        <div class="progress-info">
                            <span
                                class="status-badge"
                                :style="{ backgroundColor: getStatusColor(task.status) }"
                            >
                                {{ getStatusText(task.status) }}
                            </span>
                        </div>
                        <div class="progress-circle-container">
                            <div class="progress-circle-wrapper">
                                <svg class="progress-circle" viewBox="0 0 100 100">
                                    <!-- Background circle -->
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e9ecef"
                                        stroke-width="8"
                                        class="progress-bg"
                                    />
                                    <!-- Progress circle -->
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        :stroke="getStatusColor(task.status)"
                                        stroke-width="8"
                                        stroke-linecap="round"
                                        :stroke-dasharray="circumference"
                                        :stroke-dashoffset="
                                            circumference - (task.progress / 100) * circumference
                                        "
                                        class="progress-fill-circle"
                                    />
                                </svg>
                                <div class="progress-text">{{ task.progress }}%</div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                :value="task.progress"
                                @input="
                                    updateProgress(
                                        task.id,
                                        parseInt(($event.target as HTMLInputElement).value),
                                    )
                                "
                                class="progress-slider"
                            />
                        </div>
                    </div>

                    <div class="task-actions">
                        <button
                            @click="deleteTask(task.id)"
                            class="delete-button"
                            title="Delete task"
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.task-manager {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--background-color);
    width: 100%;
}

.task-header {
    background-color: var(--primary-color);
    color: white;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: var(--box-shadow);
}

.back-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.back-button svg {
    width: 24px;
    height: 24px;
}

.task-header h2 {
    flex: 1;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.create-task-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-task-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
}

.create-task-button svg {
    width: 24px;
    height: 24px;
}

.task-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.create-task-form {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
}

.dark-theme .create-task-form {
    background: #2a2a2a;
    border-color: #444;
}

.task-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 16px;
    background: white;
    color: var(--text-color);
}

.dark-theme .task-input {
    background: #333;
    border-color: #444;
    color: #e0e0e0;
}

.task-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.form-actions {
    display: flex;
    gap: 12px;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary:hover {
    background-color: var(--accent-color);
    transform: translateY(-1px);
}

.btn-secondary {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dark-theme .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.tasks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-state svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    color: #adb5bd;
}

.empty-state p {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
}

.empty-state small {
    font-size: 14px;
    opacity: 0.7;
}

.task-item {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    transition: all 0.2s;
}

.dark-theme .task-item {
    background: #2a2a2a;
    border-color: #444;
}

.task-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.task-info {
    flex: 1;
}

.task-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
}

.task-date {
    margin: 0;
    font-size: 13px;
    color: #6c757d;
}

.dark-theme .task-date {
    color: #adb5bd;
}

.task-assignees {
    display: flex;
    gap: 8px;
    margin-left: 16px;
}

.assignee-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
}

.task-progress {
    margin-bottom: 16px;
}

.progress-info {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
}

.status-badge {
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.progress-circle-container {
    display: flex;
    align-items: center;
    gap: 16px;
}

.progress-circle-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}

.progress-circle {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.progress-bg {
    stroke: #e9ecef;
}

.dark-theme .progress-bg {
    stroke: #444;
}

.progress-fill-circle {
    transition: stroke-dashoffset 0.3s ease;
    transform-origin: center;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color);
}

.progress-slider {
    flex: 1;
    height: 4px;
    background: transparent;
    outline: none;
    border-radius: 2px;
    cursor: pointer;
    margin: 0;
}

.progress-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.task-actions {
    display: flex;
    justify-content: flex-end;
}

.delete-button {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.delete-button:hover {
    background-color: rgba(220, 53, 69, 0.1);
    transform: scale(1.05);
}

.delete-button svg {
    width: 18px;
    height: 18px;
}

@media (max-width: 768px) {
    .task-header {
        padding: 14px;
    }

    .task-header h2 {
        font-size: 18px;
    }

    .task-content {
        padding: 16px;
    }

    .task-item {
        padding: 16px;
    }

    .task-main {
        flex-direction: column;
        gap: 12px;
    }

    .task-assignees {
        margin-left: 0;
    }

    .assignee-avatar {
        width: 28px;
        height: 28px;
        font-size: 11px;
    }

    .progress-circle-container {
        flex-direction: column;
        gap: 12px;
        align-items: center;
    }

    .progress-circle-wrapper {
        width: 60px;
        height: 60px;
    }

    .progress-text {
        font-size: 12px;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
    }
}
</style>
