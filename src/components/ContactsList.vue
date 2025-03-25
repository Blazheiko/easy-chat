<script setup lang="ts">
import { ref } from 'vue'

interface Contact {
  name: string
  unreadCount?: number
  isActive?: boolean
  isOnline?: boolean
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
}

const contacts = ref<Contact[]>([
  {
    name: 'John Smith',
    unreadCount: 2,
    isActive: true,
    isOnline: true,
    lastMessage: 'Perfect, see you then!',
    lastMessageTime: '10:30 AM',
  },
  {
    name: 'Mary Johnson',
    unreadCount: 5,
    isOnline: true,
    lastMessage: 'I just sent you the files you requested',
    lastMessageTime: 'Yesterday',
  },
  {
    name: 'Alex Wilson',
    isOnline: false,
    lastMessage: 'When are you planning to finish the project?',
    lastMessageTime: '2 days ago',
  },
  {
    name: 'Helen Brown',
    unreadCount: 1,
    isOnline: false,
    lastMessage: 'Thank you for your help!',
    lastMessageTime: 'Monday',
  },
])

const searchQuery = ref('')
const emit = defineEmits(['toggle-contacts'])

// Фильтрация контактов по поисковому запросу
const filteredContacts = () => {
  if (!searchQuery.value) return contacts.value

  return contacts.value.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
}

// Получение инициалов пользователя из имени
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
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
      <div
        v-for="contact in filteredContacts()"
        :key="contact.name"
        class="contact"
        :class="{ active: contact.isActive }"
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

      <div v-if="filteredContacts().length === 0" class="no-results">
        No contacts found for "{{ searchQuery }}"
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
}
</style>
