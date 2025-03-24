<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthModals from '../components/AuthModals.vue'

const router = useRouter()
const isLoginModalVisible = ref(true)
const isRegisterModalVisible = ref(false)
const logoText = ref('Easy Chat')
const typingComplete = ref(false)

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

// Эффект печатающего текста для лого
onMounted(() => {
  const text = 'Easy Chat'
  let i = 0
  logoText.value = ''

  const typeWriter = () => {
    if (i < text.length) {
      logoText.value += text.charAt(i)
      i++
      setTimeout(typeWriter, 150)
    } else {
      typingComplete.value = true
    }
  }

  // Запускаем анимацию печати с небольшой задержкой
  setTimeout(typeWriter, 500)
})
</script>

<template>
  <div class="login-page">
    <div class="auth-container">
      <div class="logo" :class="{ 'typing-complete': typingComplete }">
        {{ logoText }}<span class="cursor"></span>
      </div>

      <div class="welcome-message">
        <h1>Welcome to Easy Chat</h1>
        <p>Connect with friends and colleagues instantly</p>
      </div>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M20,2H4A2,2,0,0,0,2,4V22l4-4H20a2,2,0,0,0,2-2V4A2,2,0,0,0,20,2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="feature-text">
            <h3>Real-time Messaging</h3>
            <p>Chat with your contacts instantly with fast message delivery</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M21,7,12,2,3,7V17L12,22l9-5Z" fill="currentColor" />
            </svg>
          </div>
          <div class="feature-text">
            <h3>Modern Design</h3>
            <p>Enjoy a clean and intuitive interface designed for comfort</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M18,8A6,6,0,0,0,6,8c0,7-3,9-3,9H21S18,15,18,8Z" fill="currentColor" />
              <path d="M13.73,21a2,2,0,0,1-3.46,0" fill="currentColor" />
            </svg>
          </div>
          <div class="feature-text">
            <h3>Notifications</h3>
            <p>Never miss a message with our notification system</p>
          </div>
        </div>
      </div>

      <div class="auth-buttons">
        <button class="auth-button" @click="showLoginModal">Sign In</button>
        <button class="auth-button register" @click="showRegisterModal">Create Account</button>
      </div>

      <div class="manifesto-link-container">
        <router-link to="/manifesto" class="manifesto-link">Read our Manifesto</router-link>
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
  width: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  width: 100%;
  padding: 40px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 42px;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 30px;
  letter-spacing: -1px;
  position: relative;
  display: inline-block;
}

.cursor {
  position: absolute;
  right: -12px;
  top: 5%;
  height: 90%;
  width: 3px;
  background-color: var(--primary-color);
  animation: blink 1s infinite;
}

.typing-complete .cursor {
  animation: fadeOut 0.5s forwards;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
}

.welcome-message {
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
}

.welcome-message h1 {
  color: var(--text-color);
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 28px;
}

.welcome-message p {
  color: #6c757d;
  font-size: 16px;
  line-height: 1.5;
}

.features {
  width: 100%;
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  background-color: #eef1ff;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.1);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 10px;
  padding: 8px;
  flex-shrink: 0;
}

.feature-text {
  flex: 1;
}

.feature-text h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.auth-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 10px;
}

.auth-button {
  padding: 14px 0;
  flex: 1;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-button:hover {
  background-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.auth-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.auth-button.register {
  background-color: white;
  color: var(--primary-color);
  border: 1px solid rgba(26, 115, 232, 0.2);
}

.auth-button.register:hover {
  background-color: rgba(26, 115, 232, 0.05);
  color: var(--accent-color);
  border-color: var(--primary-color);
}

.auth-button.register:active {
  background-color: rgba(26, 115, 232, 0.1);
}

.manifesto-link-container {
  margin-top: 24px;
  text-align: center;
}

.manifesto-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.manifesto-link:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-container {
    padding: 30px 20px;
    border-radius: 16px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .logo {
    font-size: 36px;
    margin-bottom: 20px;
  }

  .welcome-message h1 {
    font-size: 22px;
  }

  .welcome-message p {
    font-size: 14px;
  }

  .feature-item {
    padding: 12px;
    margin-bottom: 15px;
  }

  .feature-icon {
    width: 36px;
    height: 36px;
  }

  .feature-text h3 {
    font-size: 15px;
  }

  .feature-text p {
    font-size: 13px;
  }

  .auth-buttons {
    flex-direction: column;
  }

  .auth-button {
    width: 100%;
    padding: 12px 0;
    font-size: 15px;
  }
}
</style>
