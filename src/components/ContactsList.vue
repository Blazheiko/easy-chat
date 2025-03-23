<script setup lang="ts">
import { ref } from 'vue'

interface Contact {
  name: string
  unreadCount?: number
  isActive?: boolean
}

const contacts = ref<Contact[]>([
  { name: 'John Smith', unreadCount: 2, isActive: true },
  { name: 'Mary Johnson', unreadCount: 5 },
  { name: 'Alex Wilson' },
  { name: 'Helen Brown', unreadCount: 1 },
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
      <span>{{ contact.name }}</span>
      <span v-if="contact.unreadCount" class="unread-count">
        {{ contact.unreadCount }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.contacts {
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.contacts-header {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}

.contacts-header h2 {
  flex: 1;
  margin: 0;
  font-size: 1.2rem;
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
  padding: 10px;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.contact:hover {
  background-color: #e6f3ff;
}

.contact.active {
  background-color: #003399;
  color: white;
}

.contact:active {
  transform: scale(0.98);
}

.unread-count {
  background-color: #ff3b30;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
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
    background-color: #f5f5f5;
    padding-top: 0;
  }

  .contacts.show {
    left: 0;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .contacts-header {
    position: sticky;
    top: 0;
    background-color: #f5f5f5;
    z-index: 1001;
    padding: 15px 0;
  }

  .close-contacts {
    display: block;
  }
}
</style>
