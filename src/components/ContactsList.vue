<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useContactsStore } from '@/stores/contacts'
import type { Contact } from '@/stores/contacts'
// import { TransitionGroup } from 'vue'

const contactsStore = useContactsStore()
const searchQuery = ref('')
const showNews = ref(false)
const unreadNewsCount = ref(3)
const emit = defineEmits(['toggle-contacts', 'toggle-news'])
const editInput = ref<HTMLInputElement | null>(null)

// Добавляем состояние для контекстного меню
const contextMenu = ref({
    show: false,
    x: 0,
    y: 0,
    contactIndex: -1,
    isEditing: false,
    editName: '',
})

// Добавляем состояние для редактирования контакта
const editingContact = ref({
    index: -1,
    name: '',
})

// Функция для обработки клика по контакту
const handleContactClick = (contact: Contact) => {
    contactsStore.setActiveContact(contact.name)
}

// Функция для переключения отображения новостей
const toggleNews = () => {
    showNews.value = !showNews.value
    if (showNews.value) {
        unreadNewsCount.value = 0
    }
    emit('toggle-news', showNews.value)
}

// Фильтрация и сортировка контактов
const filteredContacts = () => {
    let filtered = contactsStore.contacts

    // Применяем фильтр по поисковому запросу
    if (searchQuery.value) {
        filtered = filtered.filter((contact) =>
            contact.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
        )
    }

    // Сортируем контакты: активный контакт всегда сверху
    return filtered.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1
        if (!a.isActive && b.isActive) return 1
        return 0
    })
}

// Получение инициалов пользователя из имени
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

// Функции для работы с контекстным меню
const showContextMenu = (event: MouseEvent, index: number, name: string) => {
    event.preventDefault()
    contextMenu.value = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        contactIndex: index,
        isEditing: false,
        editName: name,
    }
}

const hideContextMenu = () => {
    contextMenu.value.show = false
    contextMenu.value.contactIndex = -1
    contextMenu.value.isEditing = false
    contextMenu.value.editName = ''
}

const startEditing = () => {
    contextMenu.value.isEditing = true
    // Добавляем небольшую задержку, чтобы DOM обновился
    setTimeout(() => {
        editInput.value?.focus()
        editInput.value?.select() // Выделяем весь текст
    }, 0)
}

const saveEdit = () => {
    if (contextMenu.value.contactIndex !== -1 && contextMenu.value.editName.trim()) {
        contactsStore.updateContact(contextMenu.value.contactIndex, {
            name: contextMenu.value.editName,
        })
        hideContextMenu()
    }
}

const cancelEdit = () => {
    hideContextMenu()
}

const deleteContact = () => {
    if (contextMenu.value.contactIndex !== -1) {
        contactsStore.deleteContact(contextMenu.value.contactIndex)
        hideContextMenu()
    }
}

// Функции для работы с редактированием контакта
const startContactEdit = (index: number, name: string) => {
    editingContact.value = {
        index,
        name,
    }
}

const saveContactEdit = () => {
    if (editingContact.value.index !== -1 && editingContact.value.name.trim()) {
        contactsStore.updateContact(editingContact.value.index, {
            name: editingContact.value.name,
        })
        editingContact.value.index = -1
        editingContact.value.name = ''
    }
}

const cancelContactEdit = () => {
    editingContact.value.index = -1
    editingContact.value.name = ''
}

onMounted(() => {
    // Добавляем обработчик клика вне контекстного меню
    document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
    // Удаляем обработчик клика
    document.removeEventListener('click', hideContextMenu)
})
</script>

<template>
    <div class="contacts-list">
        <div class="contacts-header">
            <button class="close-contacts" @click="emit('toggle-contacts')">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
            <h2>Contacts</h2>
        </div>

        <div class="news-button-container">
            <button class="news-button" :class="{ active: showNews }" @click="toggleNews">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                >
                    <path
                        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 9H4v-3h7v3zm0-4H4V6h7v3zm9 4h-7v-3h7v3zm0-4h-7V6h7v3z"
                    />
                </svg>
                <span>Новости</span>
                <span v-if="unreadNewsCount > 0" class="news-unread-count">{{
                    unreadNewsCount
                }}</span>
            </button>
        </div>

        <div class="search-container">
            <div class="search-input-wrapper">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    class="search-icon"
                >
                    <path
                        d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    />
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Search contacts"
                />
            </div>
        </div>

        <div class="contacts-list-container">
            <TransitionGroup name="contact-list" tag="div">
                <div
                    v-for="(contact, index) in filteredContacts()"
                    :key="contact.name"
                    class="contact"
                    :class="{ active: contact.isActive }"
                    @click="handleContactClick(contact)"
                    @contextmenu="showContextMenu($event, index, contact.name)"
                >
                    <div class="contact-avatar">
                        <div class="avatar">{{ getInitials(contact.name) }}</div>
                        <div class="status-indicator" :class="{ online: contact.isOnline }"></div>
                    </div>

                    <div class="contact-details">
                        <div class="contact-header">
                            <span class="contact-name">{{ contact.name }}</span>
                            <span class="message-time">{{ contact.lastMessageTime }}</span>
                        </div>
                        <div class="contact-message">
                            <p class="last-message">{{ contact.lastMessage }}</p>
                            <span v-if="contact.unreadCount" class="unread-count">
                                {{ contact.unreadCount }}
                            </span>
                        </div>
                    </div>
                </div>
            </TransitionGroup>

            <div v-if="filteredContacts().length === 0" class="no-results">
                No contacts found for "{{ searchQuery }}"
            </div>
        </div>

        <!-- Контекстное меню -->
        <div
            v-if="contextMenu.show"
            class="context-menu"
            :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
            @click.stop
        >
            <div v-if="contextMenu.isEditing" class="edit-mode">
                <input
                    v-model="contextMenu.editName"
                    type="text"
                    class="edit-input"
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                    ref="editInput"
                />
                <div class="edit-actions">
                    <button @click="saveEdit" class="edit-button save">Save</button>
                    <button @click="cancelEdit" class="edit-button cancel">Cancel</button>
                </div>
            </div>
            <div v-else class="menu-items">
                <button @click.stop="startEditing" class="menu-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.05C21.1 6.66 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.34 2.9 16.95 3.29L15.66 4.58L19.42 8.34L20.71 7.05Z"
                            fill="currentColor"
                        />
                    </svg>
                    Edit
                </button>
                <button @click.stop="deleteContact" class="menu-item delete">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            fill="currentColor"
                        />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.contacts-list {
    background-color: white;
    border-right: 1px solid var(--border-color);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.dark-theme .contacts-list {
    background-color: #1e1e1e;
    border-right: 1px solid #444;
}

.contacts-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.dark-theme .contacts-header {
    border-bottom: 1px solid #444;
    background-color: #0d47a1;
}

.contacts-header h2 {
    flex: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
}

.dark-theme .contacts-header h2 {
    color: white;
}

.close-contacts {
    display: none;
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
    color: var(--text-color);
}

.close-contacts svg {
    width: 24px;
    height: 24px;
}

.close-contacts:hover {
    opacity: 0.8;
}

.search-container {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #adb5bd;
}

.dark-theme .search-icon {
    color: #777;
}

.search-input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 14px;
    background-color: #f8f9fa;
    transition: all 0.2s ease;
}

.dark-theme .search-input {
    background-color: #333;
    border-color: #444;
    color: #e0e0e0;
}

.dark-theme .search-input:focus {
    border-color: var(--primary-color);
    background-color: #444;
    box-shadow: 0 0 0 3px rgba(100, 181, 246, 0.2);
}

.contacts-list-container {
    position: relative;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.contacts-list-container::-webkit-scrollbar {
    width: 5px;
}

.contacts-list-container::-webkit-scrollbar-track {
    background: transparent;
}

.contacts-list-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.contact {
    padding: 12px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.dark-theme .contact {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.contact-avatar {
    position: relative;
    flex-shrink: 0;
}

.avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: var(--primary-color);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 16px;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #dee2e6;
    border: 2px solid white;
    position: absolute;
    bottom: 0;
    right: 0;
    transition: all 0.2s ease;
}

.dark-theme .status-indicator {
    border-color: #1e1e1e;
}

.status-indicator.online {
    background-color: #28a745;
    box-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
}

.contact-details {
    flex: 1;
    min-width: 0;
}

.contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.contact-name {
    font-weight: 500;
    font-size: 15px;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dark-theme .contact-name {
    color: #e0e0e0;
}

.message-time {
    font-size: 12px;
    color: #6c757d;
    white-space: nowrap;
    margin-left: 8px;
}

.dark-theme .message-time {
    color: #adb5bd;
}

.contact-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.last-message {
    margin: 0;
    font-size: 13px;
    color: #6c757d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
}

.dark-theme .last-message {
    color: #adb5bd;
}

.contact:hover {
    background-color: rgba(26, 115, 232, 0.05);
}

.dark-theme .contact:hover {
    background-color: rgba(100, 181, 246, 0.1);
}

.contact.active {
    background-color: rgba(26, 115, 232, 0.1);
}

.dark-theme .contact.active {
    background-color: rgba(100, 181, 246, 0.15);
}

.contact.active .contact-name {
    color: var(--primary-color);
    font-weight: 600;
}

.contact.active .status-indicator.online {
    background-color: #2ecc71;
    box-shadow: 0 0 5px rgba(46, 204, 113, 0.5);
}

.unread-count {
    background-color: var(--primary-color);
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
    min-width: 22px;
    height: 22px;
    text-align: center;
    font-weight: 500;
    flex-shrink: 0;
}

.no-results {
    padding: 30px 20px;
    text-align: center;
    color: #6c757d;
    font-size: 14px;
}

.dark-theme .no-results {
    color: #adb5bd;
}

.news-button-container {
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-color);
}

.news-button {
    width: 100%;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.news-button:hover {
    background-color: var(--accent-color);
}

.news-button.active {
    background-color: #0d47a1;
    box-shadow: 0 0 0 3px rgba(100, 181, 246, 0.3);
}

.dark-theme .news-button {
    background-color: #0d47a1;
}

.dark-theme .news-button:hover {
    background-color: #1565c0;
}

.dark-theme .news-button.active {
    background-color: #1565c0;
    box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.5);
}

.dark-theme .news-button-container {
    border-bottom: 1px solid #444;
}

.news-unread-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 12px;
    padding: 2px 6px;
    font-size: 12px;
    min-width: 20px;
    height: 20px;
    text-align: center;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    border: 2px solid white;
}

.dark-theme .news-unread-count {
    background-color: #f5222d;
    border-color: #1e1e1e;
}

@media (max-width: 768px) {
    .contacts-list {
        background-color: white;
        width: 100%;
        max-width: 100%;
    }

    .dark-theme .contacts-list {
        background-color: #1e1e1e;
    }

    .contacts-header {
        padding: 14px 16px;
        background-color: var(--primary-color);
        color: white;
    }

    .contacts-header h2 {
        color: white;
    }

    .close-contacts {
        display: block;
        color: white;
    }

    .close-contacts svg path {
        fill: white;
    }

    .search-container {
        padding: 12px 16px;
    }

    .contact {
        padding: 12px 16px;
    }

    .contacts-list-container::-webkit-scrollbar {
        display: none;
    }

    .contacts-list-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .last-message {
        max-width: 200px;
    }

    .news-button-container {
        padding: 12px 16px;
    }

    .news-unread-count {
        top: -5px;
        right: -5px;
        font-size: 11px;
        min-width: 18px;
        height: 18px;
        padding: 1px 5px;
    }
}

/* Анимации для списка контактов */
.contact-list-move,
.contact-list-enter-active,
.contact-list-leave-active {
    transition: all 0.3s ease;
}

.contact-list-enter-from,
.contact-list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.contact-list-leave-active {
    position: absolute;
}

.contact-edit-mode {
    flex: 1;
    margin-right: 8px;
}

.contact-edit-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 15px;
    background-color: white;
    color: var(--text-color);
}

.dark-theme .contact-edit-input {
    background-color: #333;
    border-color: #444;
    color: #e0e0e0;
}

.contact-edit-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}

.dark-theme .contact-edit-input:focus {
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.context-menu {
    position: fixed;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 8px;
    z-index: 1000;
    min-width: 150px;
    user-select: none;
}

.dark-theme .context-menu {
    background-color: #2a2a2a;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.menu-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: none;
    color: var(--text-color);
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s ease;
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dark-theme .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.menu-item svg {
    width: 16px;
    height: 16px;
}

.menu-item.delete {
    color: #dc3545;
}

.menu-item.delete:hover {
    background-color: rgba(220, 53, 69, 0.1);
}

.edit-mode {
    padding: 8px;
}

.edit-input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-bottom: 8px;
    font-size: 14px;
    background-color: white;
    color: var(--text-color);
    outline: none;
}

.dark-theme .edit-input {
    background-color: #333;
    border-color: #444;
    color: #e0e0e0;
}

.edit-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}

.dark-theme .edit-input:focus {
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.edit-actions {
    display: flex;
    gap: 8px;
}

.edit-button {
    flex: 1;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.edit-button.save {
    background-color: var(--primary-color);
    color: white;
}

.edit-button.save:hover {
    background-color: var(--accent-color);
}

.edit-button.cancel {
    background-color: #e9ecef;
    color: #6c757d;
}

.dark-theme .edit-button.cancel {
    background-color: #444;
    color: #adb5bd;
}

.edit-button.cancel:hover {
    background-color: #dee2e6;
}

.dark-theme .edit-button.cancel:hover {
    background-color: #555;
}

.contact {
    cursor: pointer;
}
</style>
