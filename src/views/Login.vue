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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.logo {
  font-size: 42px;
  font-weight: 800;
  color: #1a73e8;
  margin-bottom: 40px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: -1px;
}

.welcome-message {
  text-align: center;
  margin-bottom: 40px;
  max-width: 500px;
}

.welcome-message h1 {
  color: #212529;
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 32px;
}

.welcome-message p {
  color: #6c757d;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
}

.auth-buttons {
  display: flex;
  gap: 16px;
}

.auth-button {
  padding: 12px 30px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-button:hover {
  background-color: #1765cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.auth-button:active {
  background-color: #135cbb;
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.auth-button.register {
  background-color: white;
  color: #1a73e8;
  border: 1px solid rgba(26, 115, 232, 0.2);
}

.auth-button.register:hover {
  background-color: rgba(26, 115, 232, 0.05);
  color: #1765cc;
  border-color: #1a73e8;
}

.auth-button.register:active {
  background-color: rgba(26, 115, 232, 0.1);
}

@media (max-width: 768px) {
  .welcome-message h1 {
    font-size: 28px;
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
  }

  .auth-button {
    width: 100%;
  }
}
</style>
