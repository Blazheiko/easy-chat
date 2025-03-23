<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  text: string
  time: string
  isSent: boolean
  status?: 'sent' | 'delivered' | 'read'
  date?: string
}

const messages = ref<Message[]>([
  { text: 'Hi! How are you?', time: '10:30 AM', isSent: false, date: 'Today' },
  { text: "Hello! I'm fine, thanks!", time: '10:31 AM', isSent: true, status: 'read' },
  {
    text: 'Would you like to grab lunch tomorrow?',
    time: '3:45 PM',
    isSent: false,
    date: 'Yesterday',
  },
  { text: 'Sure, that sounds great!', time: '3:47 PM', isSent: true, status: 'read' },
  { text: "Let's meet at the usual place?", time: '3:47 PM', isSent: true, status: 'delivered' },
  { text: 'Perfect, see you then!', time: '3:50 PM', isSent: false },
])

const newMessage = ref('')
const isTyping = ref(false)

const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({
      text: newMessage.value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'sent',
    })
    newMessage.value = ''
  }
}

defineEmits(['toggle-contacts', 'show-login', 'show-register'])

// Демонстрационная функция для имитации печатания
const simulateTyping = () => {
  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
  }, 3000)
}
</script>

<template>
  <div class="chat-area">
    <div class="chat-header">
      <button class="toggle-contacts" @click="$emit('toggle-contacts')">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="white" />
        </svg>
      </button>
      <h2>John Smith</h2>
      <div class="header-buttons">
        <button
          class="test-typing-button"
          @click="simulateTyping"
          title="Тест индикатора печатания"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="white"
          >
            <path
              d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"
            />
          </svg>
        </button>
        <button class="auth-header-button" @click="$emit('show-login')">Sign In</button>
      </div>
    </div>

    <div class="messages-container">
      <div class="messages">
        <template v-for="(message, index) in messages" :key="index">
          <div v-if="message.date" class="date-divider">
            <span>{{ message.date }}</span>
          </div>
          <div :class="['message', message.isSent ? 'sent' : 'received']">
            {{ message.text }}
            <div class="message-footer">
              <span>{{ message.time }}</span>
              <span v-if="message.isSent" class="message-status" :class="message.status">
                <svg
                  v-if="message.status === 'read'"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 7L9.429 15.571L6 12.143"
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18 7L9.429 15.571L6 12.143"
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    transform="translate(4 0)"
                  />
                </svg>
                <svg
                  v-else-if="message.status === 'delivered'"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 7L9.429 15.571L6 12.143"
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="typing-indicator" v-if="isTyping">
      <span>John is typing</span>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="newMessage"
        type="text"
        class="message-input"
        placeholder="Type a message..."
        @keyup.enter="sendMessage"
        @focus="simulateTyping"
      />
      <button class="send-button" @click="sendMessage">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.chat-header {
  background-color: #003399;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

.chat-header h2 {
  padding-left: 40px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.messages {
  flex: 1;
  padding: 20px;
  padding-bottom: 0;
  overflow-y: auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.date-divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
  width: 100%;
}

.date-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #ddd;
  z-index: 1;
}

.date-divider span {
  background-color: #fff;
  padding: 0 10px;
  color: #666;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 10px;
  max-width: 70%;
  position: relative;
  word-wrap: break-word;
}

.message.sent {
  background-color: #003399;
  color: white;
  align-self: flex-end;
}

.message.received {
  background-color: #f0f0f0;
  align-self: flex-start;
}

.message-footer {
  font-size: 12px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.message.received .message-footer {
  justify-content: flex-start;
  color: #666;
}

.message.sent .message-footer {
  justify-content: flex-end;
  color: rgba(255, 255, 255, 0.8);
}

.message-status {
  display: inline-flex;
  align-items: center;
}

.message-status svg {
  width: 16px;
  height: 16px;
}

.message.sent .message-status.delivered svg {
  fill: rgba(255, 255, 255, 0.8);
}

.message.sent .message-status.read svg {
  fill: #4caf50;
}

.typing-indicator {
  padding: 10px 20px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border-top: 1px solid #eee;
  width: 100%;
  background-color: #f9f9f9;
  animation: fadeIn 0.3s ease;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: #666;
  border-radius: 50%;
  animation: typingAnimation 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes typingAnimation {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.input-area {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
  width: 100%;
  flex-shrink: 0;
}

.message-input {
  flex-grow: 1;
  padding: 15px;
  border: 2px solid #003399;
  border-radius: 25px;
  outline: none;
  width: 100%;
  max-width: calc(100% - 60px);
}

.message-input:focus {
  box-shadow: 0 0 5px rgba(0, 51, 153, 0.3);
}

.send-button {
  background-color: #003399;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.1s ease,
    opacity 0.1s ease,
    background-color 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover {
  background-color: #002277;
}

.send-button:active {
  background-color: #001e66;
  transform: scale(0.92);
}

.auth-header-button {
  background-color: transparent;
  border: 2px solid white;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    opacity 0.1s ease,
    background-color 0.2s ease;
  white-space: nowrap;
}

.auth-header-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.auth-header-button:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.toggle-contacts {
  display: none;
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.toggle-contacts svg {
  width: 24px;
  height: 24px;
}

.toggle-contacts:hover {
  opacity: 0.8;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.test-typing-button {
  background-color: transparent;
  border: none;
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.test-typing-button:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .chat-area {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
  }

  .chat-header {
    padding: 15px;
  }

  .chat-header h2 {
    padding-left: 10px;
    font-size: 1.2rem;
  }

  .message {
    max-width: 85%;
  }

  .input-area {
    padding: 15px;
  }

  .message-input {
    padding: 12px;
    font-size: 14px;
  }

  .send-button {
    width: 45px;
    height: 45px;
  }

  .toggle-contacts {
    display: block;
  }
}
</style>
