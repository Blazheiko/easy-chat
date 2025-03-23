<script setup lang="ts">
import { ref } from 'vue'

interface Contact {
  name: string
  unreadCount?: number
  isActive?: boolean
  isOnline?: boolean
}

const contacts = ref<Contact[]>([
  { name: 'John Smith', unreadCount: 2, isActive: true, isOnline: true },
  { name: 'Mary Johnson', unreadCount: 5, isOnline: true },
  { name: 'Alex Wilson', isOnline: false },
  { name: 'Helen Brown', unreadCount: 1, isOnline: false },
])

const emit = defineEmits(['toggle-contacts'])
</script>

<template>
  <div class="contacts">
    <div class="contacts-header">
      <button class="close-contacts" @click="emit('toggle-contacts')">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
            fill="#333"
          />
        </svg>
      </button>
      <h2>Контакты</h2>
    </div>
    <div
      v-for="contact in contacts"
      :key="contact.name"
      class="contact"
      :class="{ active: contact.isActive }"
    >
      <div class="contact-info">
        <div class="status-indicator" :class="{ online: contact.isOnline }"></div>
        <span>{{ contact.name }}</span>
      </div>
      <span v-if="contact.unreadCount" class="unread-count">
        {{ contact.unreadCount }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.contacts {
  background-color: #f8f9fa;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.contacts-header {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.contacts-header h2 {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.close-contacts {
  display: none;
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.close-contacts svg {
  width: 24px;
  height: 24px;
}

.close-contacts:hover {
  opacity: 0.8;
}

.contact {
  padding: 12px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #dee2e6;
  display: inline-block;
  transition: all 0.2s ease;
}

.status-indicator.online {
  background-color: #28a745;
  box-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
}

.contact:hover {
  background-color: rgba(26, 115, 232, 0.05);
  transform: translateY(-1px);
}

.contact.active {
  background-color: #1a73e8;
  color: white;
  box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
}

.contact.active .status-indicator.online {
  background-color: #8fffb0;
  box-shadow: 0 0 5px rgba(143, 255, 176, 0.5);
}

.contact:active {
  transform: translateY(0);
}

.unread-count {
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

@media (max-width: 768px) {
  .contacts {
    position: fixed;
    left: -100%;
    top: 0;
    bottom: 0;
    width: 100%;
    max-width: 300px;
    transition: left 0.3s ease;
    z-index: 1000;
    background-color: #f8f9fa;
    padding-top: 0;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .contacts.show {
    left: 0;
  }

  .contacts-header {
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    z-index: 1001;
    padding: 15px 0;
  }

  .close-contacts {
    display: block;
  }
}
</style>
