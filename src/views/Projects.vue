<script setup lang="ts">
defineOptions({ name: 'ProjectsView' })
import { ref, computed, onMounted } from 'vue'

interface Project {
    id: number
    title: string
    description: string
    assignees: string[]
    status: 'planning' | 'in-progress' | 'on-hold' | 'completed'
    priority: 'low' | 'medium' | 'high'
    progress: number
    dueDate?: string
    tags: string[]
    createdAt: string
}

const LOCAL_STORAGE_KEY = 'easy-chat-projects'

const projects = ref<Project[]>([])
const showCreateForm = ref(false)

const newProject = ref<{
    title: string
    description: string
    assignees: string
    status: Project['status']
    priority: Project['priority']
    progress: number
    dueDate: string
    tags: string
}>({
    title: '',
    description: '',
    assignees: '',
    status: 'planning',
    priority: 'medium',
    progress: 0,
    dueDate: '',
    tags: '',
})

const circumference = 2 * Math.PI * 45

const loadProjects = () => {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (raw) projects.value = JSON.parse(raw)
    } catch (e) {
        console.error('Failed to load projects', e)
    }
}

const saveProjects = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects.value))
}

onMounted(loadProjects)

const canCreate = computed(() => newProject.value.title.trim().length > 0)

const resetForm = () => {
    newProject.value = {
        title: '',
        description: '',
        assignees: '',
        status: 'planning',
        priority: 'medium',
        progress: 0,
        dueDate: '',
        tags: '',
    }
}

const createProject = () => {
    if (!canCreate.value) return
    const project: Project = {
        id: Date.now(),
        title: newProject.value.title.trim(),
        description: newProject.value.description.trim(),
        assignees: newProject.value.assignees
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        status: newProject.value.status,
        priority: newProject.value.priority,
        progress: Number(newProject.value.progress) || 0,
        dueDate: newProject.value.dueDate || undefined,
        tags: newProject.value.tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        createdAt: new Date().toISOString(),
    }
    projects.value.unshift(project)
    saveProjects()
    showCreateForm.value = false
    resetForm()
}

const deleteProject = (id: number) => {
    projects.value = projects.value.filter((p) => p.id !== id)
    saveProjects()
}

const updateProgress = (id: number, progress: number) => {
    const project = projects.value.find((p) => p.id === id)
    if (!project) return
    project.progress = progress
    if (progress === 100) project.status = 'completed'
    else if (progress > 0 && project.status === 'planning') project.status = 'in-progress'
    saveProjects()
}

const getStatusColor = (status: Project['status']): string => {
    switch (status) {
        case 'completed':
            return '#4caf50'
        case 'in-progress':
            return '#ff9800'
        case 'on-hold':
            return '#9c27b0'
        case 'planning':
            return '#607d8b'
        default:
            return '#9e9e9e'
    }
}

const getPriorityColor = (priority: Project['priority']): string => {
    switch (priority) {
        case 'high':
            return '#e53935'
        case 'medium':
            return '#fb8c00'
        case 'low':
            return '#43a047'
    }
}

const formatDate = (iso: string): string => {
    const d = new Date(iso)
    return d.toLocaleString()
}
</script>

<template>
    <div class="projects-page">
        <div class="container">
            <div class="page-header">
                <h2>Projects</h2>
                <button class="create-button" @click="showCreateForm = !showCreateForm">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path
                            d="M12 5v14m-7-7h14"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                    </svg>
                    New project
                </button>
            </div>

            <div v-if="showCreateForm" class="card">
                <h3>Create project</h3>
                <div class="form-grid">
                    <label>
                        <span>Title</span>
                        <input v-model="newProject.title" type="text" placeholder="Project title" />
                    </label>
                    <label>
                        <span>Priority</span>
                        <select v-model="newProject.priority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </label>
                    <label>
                        <span>Status</span>
                        <select v-model="newProject.status">
                            <option value="planning">Planning</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    </label>
                    <label>
                        <span>Due date</span>
                        <input v-model="newProject.dueDate" type="date" />
                    </label>
                    <label class="full">
                        <span>Description</span>
                        <textarea
                            v-model="newProject.description"
                            rows="3"
                            placeholder="Short description"
                        />
                    </label>
                    <label class="full">
                        <span>Assignees (comma separated)</span>
                        <input
                            v-model="newProject.assignees"
                            type="text"
                            placeholder="e.g. JD, AS"
                        />
                    </label>
                    <label class="full">
                        <span>Tags (comma separated)</span>
                        <input
                            v-model="newProject.tags"
                            type="text"
                            placeholder="e.g. frontend, api"
                        />
                    </label>
                    <label class="full">
                        <span>Initial progress</span>
                        <input
                            v-model.number="newProject.progress"
                            type="range"
                            min="0"
                            max="100"
                        />
                    </label>
                </div>
                <div class="form-actions">
                    <button class="btn-primary" :disabled="!canCreate" @click="createProject">
                        Create
                    </button>
                    <button class="btn-secondary" @click="showCreateForm = false">Cancel</button>
                </div>
            </div>

            <div class="projects-list" v-if="projects.length">
                <div class="project-item card" v-for="p in projects" :key="p.id">
                    <div class="item-main">
                        <div class="item-info">
                            <h4>{{ p.title }}</h4>
                            <p class="muted">Created: {{ formatDate(p.createdAt) }}</p>
                            <p class="desc" v-if="p.description">{{ p.description }}</p>
                            <div class="chips" v-if="p.tags.length">
                                <span class="chip" v-for="t in p.tags" :key="t">#{{ t }}</span>
                            </div>
                        </div>
                        <div class="meta">
                            <span
                                class="badge"
                                :style="{ backgroundColor: getStatusColor(p.status) }"
                                >{{ p.status }}</span
                            >
                            <span
                                class="badge"
                                :style="{ backgroundColor: getPriorityColor(p.priority) }"
                                >{{ p.priority }}</span
                            >
                            <div class="assignees" v-if="p.assignees.length">
                                <div class="assignee" v-for="a in p.assignees" :key="a" :title="a">
                                    {{ a }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="progress-row">
                        <div class="circle-wrapper">
                            <svg viewBox="0 0 100 100" class="circle">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#e9ecef"
                                    stroke-width="8"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    :stroke="getStatusColor(p.status)"
                                    stroke-width="8"
                                    stroke-linecap="round"
                                    :stroke-dasharray="circumference"
                                    :stroke-dashoffset="
                                        circumference - (p.progress / 100) * circumference
                                    "
                                />
                            </svg>
                            <div class="progress-text">{{ p.progress }}%</div>
                        </div>
                        <input
                            class="progress-slider"
                            type="range"
                            min="0"
                            max="100"
                            :value="p.progress"
                            @input="
                                updateProgress(
                                    p.id,
                                    parseInt(($event.target as HTMLInputElement).value),
                                )
                            "
                        />
                    </div>

                    <div class="actions">
                        <button class="delete" title="Delete" @click="deleteProject(p.id)">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path
                                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="empty">
                <p>No projects</p>
                <small>Create your first project with the button above</small>
            </div>
        </div>
    </div>
</template>

<style scoped>
.projects-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--header-height));
    background-color: var(--background-color);
}

.container {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0 16px;
}

.create-button {
    background: rgba(20, 95, 194, 0.1);
    border: 1px solid rgba(20, 95, 194, 0.2);
    color: var(--text-color);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.create-button:hover {
    background: rgba(20, 95, 194, 0.2);
}

.card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 16px;
}

.dark-theme .card {
    background: #2a2a2a;
    border-color: #444;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
}

.form-grid label {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-grid label.full {
    grid-column: 1 / -1;
}

input,
select,
textarea {
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: white;
    color: var(--text-color);
}

.dark-theme input,
.dark-theme select,
.dark-theme textarea {
    background: #333;
    border-color: #444;
    color: #e0e0e0;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.btn-secondary {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
}

.projects-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.project-item .item-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.item-info h4 {
    margin: 0 0 6px 0;
}
.item-info .muted {
    color: #6c757d;
    font-size: 13px;
}
.dark-theme .muted {
    color: #adb5bd;
}
.item-info .desc {
    margin-top: 8px;
}

.chips {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
}
.chip {
    background: #e9ecef;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}
.dark-theme .chip {
    background: #3a3a3a;
}

.meta {
    display: flex;
    align-items: center;
    gap: 10px;
}
.badge {
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    text-transform: capitalize;
}

.assignees {
    display: flex;
    gap: 8px;
}
.assignee {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
}

.progress-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 12px;
}

.circle-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}
.circle {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}
.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
}

.progress-slider {
    flex: 1;
    height: 4px;
    background: transparent;
}
.progress-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    border: 2px solid white;
}

.actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}
.actions .delete {
    background: none;
    border: none;
    color: #dc3545;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;
}
.actions .delete:hover {
    background: rgba(220, 53, 69, 0.1);
}

.empty {
    text-align: center;
    color: #6c757d;
    padding: 60px 20px;
}
.dark-theme .empty {
    color: #adb5bd;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
