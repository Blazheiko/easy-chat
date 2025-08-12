<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

interface Task {
    id: number
    title: string
    description: string | null
    user_id: number
    project_id: number | null
    status: 'TODO' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    progress: number
    is_completed: boolean
    tags: string | null
    due_date: Date | null
    start_date: Date | null
    estimated_hours: number | null
    actual_hours: number | null
    parent_task_id: number | null
    created_at: Date
    updated_at: Date
}

const STATUSES: Task['status'][] = ['TODO', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
const PRIORITIES: Task['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const emit = defineEmits(['toggle-contacts'])

const tasks = ref<Task[]>([
    {
        id: 1,
        title: 'Fix notification bug',
        description: 'Investigate push notification drop on iOS',
        user_id: 101,
        project_id: 10,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 75,
        is_completed: false,
        tags: 'bug,notifications,ios',
        due_date: new Date('2024-01-20T18:00:00'),
        start_date: new Date('2024-01-15T10:30:00'),
        estimated_hours: 8,
        actual_hours: 5.5,
        parent_task_id: null,
        created_at: new Date('2024-01-15T10:30:00'),
        updated_at: new Date('2024-01-16T12:00:00'),
    },
    {
        id: 2,
        title: 'Add dark theme',
        description: 'Implement dark theme toggle and palette',
        user_id: 102,
        project_id: 10,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        progress: 100,
        is_completed: true,
        tags: 'feature,ui,theme',
        due_date: null,
        start_date: new Date('2024-01-12T09:00:00'),
        estimated_hours: 6,
        actual_hours: 6.5,
        parent_task_id: null,
        created_at: new Date('2024-01-14T14:20:00'),
        updated_at: new Date('2024-01-15T16:45:00'),
    },
    {
        id: 3,
        title: 'Optimize performance',
        description: null,
        user_id: 101,
        project_id: 11,
        status: 'ON_HOLD',
        priority: 'URGENT',
        progress: 30,
        is_completed: false,
        tags: 'performance',
        due_date: new Date('2024-01-25T17:00:00'),
        start_date: new Date('2024-01-16T09:15:00'),
        estimated_hours: 12,
        actual_hours: null,
        parent_task_id: null,
        created_at: new Date('2024-01-16T09:15:00'),
        updated_at: new Date('2024-01-17T11:45:00'),
    },
])

const showCreateForm = ref(false)

const newTaskForm = reactive({
    title: '' as string,
    description: '' as string,
    user_id: null as number | null,
    project_id: null as number | null,
    status: 'TODO' as Task['status'],
    priority: 'MEDIUM' as Task['priority'],
    progress: 0 as number,
    is_completed: false as boolean,
    tags: '' as string,
    due_date_input: '' as string,
    start_date_input: '' as string,
    estimated_hours: null as number | null,
    actual_hours: null as number | null,
    parent_task_id: null as number | null,
})

const formatDateTime = (date: Date | null): string => {
    if (!date) return '-'
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const taskStatuses = {
    TODO: '#9e9e9e',
    IN_PROGRESS: '#4caf50',
    ON_HOLD: '#ff9800',
    COMPLETED: '#388e3c',
    CANCELLED: '#dc3545',
}

const getStatusColor = (status: Task['status']): string =>
    taskStatuses[status] ? taskStatuses[status] : '#9e9e9e'

const taskPriorities = {
    LOW: '#81c784',
    MEDIUM: '#66bb6a',
    HIGH: '#4caf50',
    URGENT: '#388e3c',
}

const getPriorityColor = (priority: Task['priority']): string =>
    taskPriorities[priority] ? taskPriorities[priority] : '#81c784'

const parseDateTimeLocal = (value: string): Date | null => {
    if (!value) return null
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
}

const tagsToArray = (tags: string | null): string[] => {
    if (!tags) return []
    return tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
}

const createTask = (): void => {
    if (!newTaskForm.title.trim()) return

    const now = new Date()
    const task: Task = {
        id: Date.now(),
        title: newTaskForm.title.trim(),
        description: newTaskForm.description.trim() || null,
        user_id: Number(newTaskForm.user_id ?? 0),
        project_id: newTaskForm.project_id == null ? null : Number(newTaskForm.project_id),
        status: newTaskForm.status,
        priority: newTaskForm.priority,
        progress: Number(newTaskForm.progress) || 0,
        is_completed: Boolean(newTaskForm.is_completed),
        tags: newTaskForm.tags.trim() || null,
        due_date: parseDateTimeLocal(newTaskForm.due_date_input),
        start_date: parseDateTimeLocal(newTaskForm.start_date_input),
        estimated_hours:
            newTaskForm.estimated_hours == null ? null : Number(newTaskForm.estimated_hours),
        actual_hours: newTaskForm.actual_hours == null ? null : Number(newTaskForm.actual_hours),
        parent_task_id:
            newTaskForm.parent_task_id == null ? null : Number(newTaskForm.parent_task_id),
        created_at: now,
        updated_at: now,
    }

    if (task.progress === 100) {
        task.status = 'COMPLETED'
        task.is_completed = true
    }

    tasks.value.unshift(task)

    newTaskForm.title = ''
    newTaskForm.description = ''
    newTaskForm.user_id = null
    newTaskForm.project_id = null
    newTaskForm.status = 'TODO'
    newTaskForm.priority = 'MEDIUM'
    newTaskForm.progress = 0
    newTaskForm.is_completed = false
    newTaskForm.tags = ''
    newTaskForm.due_date_input = ''
    newTaskForm.start_date_input = ''
    newTaskForm.estimated_hours = null
    newTaskForm.actual_hours = null
    newTaskForm.parent_task_id = null
    showCreateForm.value = false
}

const updateProgress = (taskId: number, progress: number): void => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    task.progress = progress
    task.updated_at = new Date()
    if (progress === 100) {
        task.status = 'COMPLETED'
        task.is_completed = true
    } else {
        if (task.status === 'COMPLETED') task.status = 'IN_PROGRESS'
        task.is_completed = false
        if (progress === 0 && task.status !== 'CANCELLED') task.status = 'TODO'
        if (progress > 0 && task.status === 'TODO') task.status = 'IN_PROGRESS'
    }
}

const editTask = (taskId: number): void => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return

    // Заполняем форму данными задачи
    newTaskForm.title = task.title
    newTaskForm.description = task.description || ''
    newTaskForm.user_id = task.user_id
    newTaskForm.project_id = task.project_id
    newTaskForm.status = task.status
    newTaskForm.priority = task.priority
    newTaskForm.progress = task.progress
    newTaskForm.is_completed = task.is_completed
    newTaskForm.tags = task.tags || ''
    newTaskForm.due_date_input = task.due_date ? task.due_date.toISOString().slice(0, 16) : ''
    newTaskForm.start_date_input = task.start_date ? task.start_date.toISOString().slice(0, 16) : ''
    newTaskForm.estimated_hours = task.estimated_hours
    newTaskForm.actual_hours = task.actual_hours
    newTaskForm.parent_task_id = task.parent_task_id

    // Удаляем старую задачу
    deleteTask(taskId)

    // Показываем форму
    showCreateForm.value = true
}

const deleteTask = (taskId: number): void => {
    tasks.value = tasks.value.filter((t) => t.id !== taskId)
}

// Calculate circumference for circular progress bar
const circumference = 2 * Math.PI * 45

onMounted(() => {})
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
                <div class="form-grid">
                    <div class="form-col">
                        <label class="form-label">Title</label>
                        <input
                            v-model="newTaskForm.title"
                            type="text"
                            placeholder="Enter task title..."
                            class="task-input"
                            @keyup.enter="createTask"
                            @keyup.esc="showCreateForm = false"
                        />
                    </div>
                    <div class="form-col">
                        <label class="form-label">Description</label>
                        <textarea
                            v-model="newTaskForm.description"
                            rows="3"
                            placeholder="Enter description..."
                            class="task-textarea"
                        />
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <label class="form-label">User ID</label>
                            <input
                                v-model.number="newTaskForm.user_id"
                                type="number"
                                class="task-input"
                            />
                        </div>
                        <div class="form-col">
                            <label class="form-label">Project ID</label>
                            <input
                                v-model.number="newTaskForm.project_id"
                                type="number"
                                class="task-input"
                            />
                        </div>
                        <div class="form-col">
                            <label class="form-label">Parent Task ID</label>
                            <input
                                v-model.number="newTaskForm.parent_task_id"
                                type="number"
                                class="task-input"
                            />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <label class="form-label">Status</label>
                            <select v-model="newTaskForm.status" class="task-select">
                                <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
                            </select>
                        </div>
                        <div class="form-col">
                            <label class="form-label">Priority</label>
                            <select v-model="newTaskForm.priority" class="task-select">
                                <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <div class="form-col form-col-checkbox">
                            <label class="form-label">Completed</label>
                            <input v-model="newTaskForm.is_completed" type="checkbox" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <label class="form-label">Progress: {{ newTaskForm.progress }}%</label>
                            <input
                                v-model.number="newTaskForm.progress"
                                type="range"
                                min="0"
                                max="100"
                                class="progress-slider"
                            />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <label class="form-label">Start Date</label>
                            <input
                                v-model="newTaskForm.start_date_input"
                                type="datetime-local"
                                class="task-input"
                            />
                        </div>
                        <div class="form-col">
                            <label class="form-label">Due Date</label>
                            <input
                                v-model="newTaskForm.due_date_input"
                                type="datetime-local"
                                class="task-input"
                            />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <label class="form-label">Estimated Hours</label>
                            <input
                                v-model.number="newTaskForm.estimated_hours"
                                type="number"
                                step="0.1"
                                class="task-input"
                            />
                        </div>
                        <div class="form-col">
                            <label class="form-label">Actual Hours</label>
                            <input
                                v-model.number="newTaskForm.actual_hours"
                                type="number"
                                step="0.1"
                                class="task-input"
                            />
                        </div>
                    </div>

                    <div class="form-col">
                        <label class="form-label">Tags (comma separated)</label>
                        <input
                            v-model="newTaskForm.tags"
                            type="text"
                            placeholder="bug, ui, refactor"
                            class="task-input"
                        />
                    </div>
                </div>

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
                            <p class="task-date">Created: {{ formatDateTime(task.created_at) }}</p>
                            <p class="task-date">Updated: {{ formatDateTime(task.updated_at) }}</p>
                        </div>

                        <div class="task-meta">
                            <span
                                class="status-badge"
                                :style="{ backgroundColor: getStatusColor(task.status) }"
                            >
                                {{ task.status }}
                            </span>
                            <span
                                class="priority-badge"
                                :style="{ backgroundColor: getPriorityColor(task.priority) }"
                            >
                                {{ task.priority }}
                            </span>
                            <span v-if="task.is_completed" class="completed-badge">Completed</span>
                        </div>
                    </div>

                    <div class="task-description" v-if="task.description">
                        {{ task.description }}
                    </div>

                    <div class="task-tags" v-if="tagsToArray(task.tags).length">
                        <span class="tag" v-for="tag in tagsToArray(task.tags)" :key="tag">{{
                            tag
                        }}</span>
                    </div>

                    <div class="dates-row">
                        <div class="date-chip">Start: {{ formatDateTime(task.start_date) }}</div>
                        <div class="date-chip">Due: {{ formatDateTime(task.due_date) }}</div>
                        <div class="date-chip" v-if="task.user_id">User ID: {{ task.user_id }}</div>
                        <div class="date-chip" v-if="task.project_id != null">
                            Project ID: {{ task.project_id }}
                        </div>
                        <div class="date-chip" v-if="task.parent_task_id != null">
                            Parent ID: {{ task.parent_task_id }}
                        </div>
                    </div>

                    <div class="hours-row">
                        <div class="hour-chip" v-if="task.estimated_hours != null">
                            Est: {{ task.estimated_hours }}h
                        </div>
                        <div class="hour-chip" v-if="task.actual_hours != null">
                            Actual: {{ task.actual_hours }}h
                        </div>
                    </div>

                    <div class="task-progress">
                        <div class="progress-circle-container">
                            <div class="progress-circle-wrapper">
                                <svg class="progress-circle" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e9ecef"
                                        stroke-width="8"
                                        class="progress-bg"
                                    />
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
                        <button @click="editTask(task.id)" class="edit-button" title="Edit task">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
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
    background: linear-gradient(135deg, #f1f8e9 0%, #c8e6c9 100%);
    width: 100%;
    overflow: hidden;
}

.dark-theme .task-manager {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.task-header {
    background-color: rgba(76, 175, 80, 0.7);
    color: white;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--box-shadow);
}

.back-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
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
    font-size: 18px;
    font-weight: 600;
}

.create-task-button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-task-button:hover {
    background: rgba(255, 255, 255, 0.2);
}

.create-task-button svg {
    width: 20px;
    height: 20px;
}

.task-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    scroll-behavior: smooth;
}

.task-content::-webkit-scrollbar {
    width: 6px;
}

.task-content::-webkit-scrollbar-track {
    background: transparent;
}

.task-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.dark-theme .task-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}

.create-task-form {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    transform: translateY(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.create-task-form::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4caf50 0%, #388e3c 50%, #81c784 100%);
}

.create-task-form:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
}

.dark-theme .create-task-form {
    background: rgba(42, 42, 42, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.form-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-col-checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}

.form-label {
    font-size: 14px;
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 4px;
}

.dark-theme .form-label {
    color: #e2e8f0;
}

.task-input {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid transparent;
    border-radius: 12px;
    font-size: 15px;
    background: rgba(255, 255, 255, 0.8);
    color: #2d3748;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.task-input:focus {
    outline: none;
    border-color: rgba(76, 175, 80, 0.9);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
    transform: translateY(-1px);
}

.dark-theme .task-input {
    background: rgba(45, 55, 72, 0.8);
    color: #e2e8f0;
}

.dark-theme .task-input:focus {
    background: rgba(45, 55, 72, 1);
    border-color: rgba(76, 175, 80, 0.9);
}

.task-select {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid transparent;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.8);
    color: #2d3748;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    cursor: pointer;
}

.task-select:focus {
    outline: none;
    border-color: rgba(76, 175, 80, 0.9);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
}

.dark-theme .task-select {
    background: rgba(45, 55, 72, 0.8);
    color: #e2e8f0;
}

.dark-theme .task-select:focus {
    background: rgba(45, 55, 72, 1);
    border-color: rgba(76, 175, 80, 0.9);
}

.task-textarea {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid transparent;
    border-radius: 12px;
    font-size: 15px;
    background: rgba(255, 255, 255, 0.8);
    color: #2d3748;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    resize: vertical;
    min-height: 80px;
}

.task-textarea:focus {
    outline: none;
    border-color: rgba(76, 175, 80, 0.9);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
    transform: translateY(-1px);
}

.dark-theme .task-textarea {
    background: rgba(45, 55, 72, 0.8);
    color: #e2e8f0;
}

.dark-theme .task-textarea:focus {
    background: rgba(45, 55, 72, 1);
    border-color: rgba(76, 175, 80, 0.9);
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn-primary {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    position: relative;
    overflow: hidden;
}

.btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
}

.btn-primary:hover::before {
    left: 100%;
}

.btn-primary:active {
    transform: translateY(-1px);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.8);
    color: #4a5568;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(76, 175, 80, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.dark-theme .btn-secondary {
    background: rgba(45, 55, 72, 0.8);
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .btn-secondary:hover {
    background: rgba(45, 55, 72, 1);
    border-color: rgba(76, 175, 80, 0.9);
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
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.task-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
        90deg,
        transparent 0%,
        var(--status-color, #4caf50) 50%,
        transparent 100%
    );
    opacity: 0.7;
}

.task-item:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border-color: rgba(76, 175, 80, 0.3);
}

.task-item:hover::before {
    opacity: 1;
    height: 6px;
}

.dark-theme .task-item {
    background: rgba(42, 42, 42, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .task-item:hover {
    border-color: rgba(76, 175, 80, 0.5);
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
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 700;
    color: #2d3748;
    line-height: 1.3;
}

.dark-theme .task-title {
    color: #e2e8f0;
}

.task-date {
    margin: 0 0 4px 0;
    font-size: 12px;
    color: #718096;
    font-weight: 500;
}

.dark-theme .task-date {
    color: #a0aec0;
}

.task-meta {
    display: flex;
    gap: 8px;
    align-items: center;
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
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
}

.status-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
}

.status-badge:hover::before {
    left: 100%;
}

.priority-badge {
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
}

.priority-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
}

.priority-badge:hover::before {
    left: 100%;
}

.completed-badge {
    color: #fff;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.task-description {
    font-size: 15px;
    color: #4a5568;
    margin-bottom: 16px;
    line-height: 1.6;
    font-weight: 400;
}

.dark-theme .task-description {
    color: #cbd5e0;
}

.task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.tag {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%);
    color: #4caf50;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid rgba(76, 175, 80, 0.2);
    transition: all 0.2s;
}

.tag:hover {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.2) 100%);
    transform: translateY(-1px);
}

.dates-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.date-chip {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-color);
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
}

.dark-theme .date-chip {
    background: rgba(255, 255, 255, 0.08);
}

.hours-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.hour-chip {
    background: rgba(30, 136, 229, 0.12);
    color: #1e88e5;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
}

.progress-circle-container {
    display: flex;
    align-items: center;
    gap: 16px;
}

.progress-circle-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
}

.progress-circle {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.progress-bg {
    stroke: #f1f5f9;
    stroke-width: 6;
}

.dark-theme .progress-bg {
    stroke: #374151;
}

.progress-fill-circle {
    transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
    stroke-width: 6;
    stroke-linecap: round;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: 700;
    color: #2d3748;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dark-theme .progress-text {
    color: #e2e8f0;
}

.progress-slider {
    flex: 1;
    height: 8px;
    background: linear-gradient(to right, #f1f5f9 0%, #f1f5f9 100%);
    outline: none;
    border-radius: 20px;
    cursor: pointer;
    margin: 0;
    transition: all 0.2s;
}

.progress-slider:hover {
    transform: scaleY(1.2);
}

.progress-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    transition: all 0.2s;
}

.progress-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
}

.progress-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    transition: all 0.2s;
}

.dark-theme .progress-slider {
    background: linear-gradient(to right, #374151 0%, #374151 100%);
}

.dark-theme .progress-slider::-webkit-slider-thumb {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

.dark-theme .progress-slider::-moz-range-thumb {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

.task-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.delete-button {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    border: 2px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
    cursor: pointer;
    padding: 12px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
}

.delete-button:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
    border-color: rgba(239, 68, 68, 0.4);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.delete-button:active {
    transform: translateY(0) scale(1);
}

.delete-button svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s;
}

.delete-button:hover svg {
    transform: scale(1.1);
}

.edit-button {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%);
    border: 2px solid rgba(76, 175, 80, 0.2);
    color: #4caf50;
    cursor: pointer;
    padding: 12px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
}

.edit-button:hover {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.2) 100%);
    border-color: rgba(76, 175, 80, 0.4);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.edit-button:active {
    transform: translateY(0) scale(1);
}

.edit-button svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s;
}

.edit-button:hover svg {
    transform: scale(1.1);
}

@media (max-width: 768px) {
    .task-manager {
        background: linear-gradient(135deg, #f1f8e9 0%, #c8e6c9 100%);
    }

    .dark-theme .task-manager {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    }

    .task-header {
        padding: 18px 20px;
    }

    .task-header h2 {
        font-size: 18px;
        margin: 0 16px;
    }

    .back-button,
    .create-task-button {
        width: 36px;
        height: 36px;
    }

    .task-content {
        padding: 20px;
    }

    .create-task-form {
        padding: 24px;
        margin-bottom: 24px;
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .task-item {
        padding: 20px;
        border-radius: 16px;
    }

    .task-main {
        flex-direction: column;
        gap: 16px;
        margin-bottom: 20px;
    }

    .task-meta {
        flex-wrap: wrap;
        gap: 6px;
    }

    .status-badge,
    .priority-badge,
    .completed-badge {
        padding: 6px 12px;
        font-size: 10px;
    }

    .task-title {
        font-size: 16px;
        margin-bottom: 8px;
    }

    .task-description {
        font-size: 14px;
        margin-bottom: 12px;
    }

    .progress-circle-container {
        flex-direction: column;
        gap: 16px;
        align-items: center;
    }

    .progress-circle-wrapper {
        width: 80px;
        height: 80px;
    }

    .progress-text {
        font-size: 14px;
    }

    .progress-slider {
        width: 100%;
        height: 6px;
    }

    .form-actions {
        flex-direction: column;
        gap: 12px;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        padding: 16px 24px;
        font-size: 16px;
    }

    .dates-row,
    .hours-row {
        flex-direction: column;
        gap: 6px;
    }

    .date-chip,
    .hour-chip {
        font-size: 11px;
        padding: 6px 10px;
    }

    .tag {
        padding: 4px 8px;
        font-size: 10px;
    }

    .edit-button,
    .delete-button {
        padding: 10px;
    }

    .edit-button svg,
    .delete-button svg {
        width: 18px;
        height: 18px;
    }

    .task-input,
    .task-select,
    .task-textarea {
        padding: 12px 16px;
        font-size: 16px; /* Prevents zoom on iOS */
    }
}

@media (max-width: 480px) {
    .task-header {
        padding: 16px 16px;
    }

    .task-header h2 {
        font-size: 16px;
        margin: 0 12px;
    }

    .back-button,
    .create-task-button {
        width: 32px;
        height: 32px;
    }

    .task-content {
        padding: 16px;
    }

    .create-task-form {
        padding: 20px;
        border-radius: 16px;
    }

    .task-item {
        padding: 16px;
        border-radius: 12px;
    }

    .progress-circle-wrapper {
        width: 70px;
        height: 70px;
    }

    .progress-text {
        font-size: 12px;
    }
}
</style>
