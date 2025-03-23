<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthModals from '../components/AuthModals.vue'

const router = useRouter()
const isLoginModalVisible = ref(true)
const isRegisterModalVisible = ref(false)

const showLoginModal = () => {
  isLoginModalVisible.value = true
  isRegisterModalVisible.value = false
}

const showRegisterModal = () => {
  isLoginModalVisible.value = false
  isRegisterModalVisible.value = true
}

const closeAuthModals = () => {
  // В реальном приложении здесь была бы логика входа пользователя
  // Пока просто перенаправляем на страницу чата после успешной авторизации
  // и добавляем фиктивные данные пользователя в localStorage
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'John Smith' }))
  router.push('/chat')
}
</script>

<template>
  <div class="login-page">
    <div class="logo">EasyChat</div>
    <div class="welcome-message">
      <h1>Welcome to EasyChat</h1>
      <p>Please sign in to continue</p>

      <div class="auth-buttons">
        <button class="auth-button" @click="showLoginModal">Sign In</button>
        <button class="auth-button register" @click="showRegisterModal">Register</button>
      </div>
    </div>

    <AuthModals
      :show-login="isLoginModalVisible"
      :show-register="isRegisterModalVisible"
      @close="closeAuthModals"
      @show-login="showLoginModal"
      @show-register="showRegisterModal"
    />
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.logo {
  font-size: 36px;
  font-weight: bold;
  color: #003399;
  margin-bottom: 40px;
}

.welcome-message {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-message h1 {
  color: #333;
  margin-bottom: 10px;
}

.welcome-message p {
  color: #666;
  margin-bottom: 30px;
}

.auth-buttons {
  display: flex;
  gap: 20px;
}

.auth-button {
  padding: 12px 30px;
  background-color: #003399;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition:
    transform 0.1s ease,
    opacity 0.1s ease,
    background-color 0.2s ease;
}

.auth-button:hover {
  background-color: #002277;
}

.auth-button:active {
  background-color: #001e66;
  transform: scale(0.98);
}

.auth-button.register {
  background-color: #f0f0f0;
  color: #003399;
  border: 2px solid #003399;
}

.auth-button.register:hover {
  background-color: #e0e0e0;
}

.auth-button.register:active {
  background-color: #d0d0d0;
}

@media (max-width: 768px) {
  .auth-buttons {
    flex-direction: column;
  }
}
</style>
