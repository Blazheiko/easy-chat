<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  showLogin: {
    type: Boolean,
    default: false,
  },
  showRegister: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'show-login', 'show-register'])

const email = ref('')
const password = ref('')
const name = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)

const closeLoginModal = () => {
  emit('close')
}

const closeRegisterModal = () => {
  emit('close')
}

const switchToRegister = () => {
  emit('close')
  setTimeout(() => emit('show-register'), 300)
}

const switchToLogin = () => {
  emit('close')
  setTimeout(() => emit('show-login'), 300)
}

const handleLogin = () => {
  // Тут была бы логика авторизации
  emit('close')
}

const handleRegister = () => {
  // Тут была бы логика регистрации
  emit('close')
}
</script>

<template>
  <!-- Login Modal -->
  <div class="modal-overlay" :class="{ show: props.showLogin }">
    <div class="modal login-modal">
      <div class="modal-header">
        <h3>Sign In</h3>
        <button class="close-modal" @click="closeLoginModal" aria-label="Close modal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
      <div class="modal-content">
        <div class="form-group">
          <label for="login-email">Email</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              class="input-icon"
            >
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
            <input
              type="email"
              id="login-email"
              v-model="email"
              placeholder="yourname@example.com"
              autocomplete="email"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              class="input-icon"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              />
            </svg>
            <input
              type="password"
              id="login-password"
              v-model="password"
              placeholder="Your password"
              autocomplete="current-password"
            />
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            Remember me
          </label>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>

        <button class="auth-button" @click="handleLogin">Sign In</button>
        <p class="auth-switch">
          Don't have an account? <a href="#" @click.prevent="switchToRegister">Register</a>
        </p>
      </div>
    </div>
  </div>

  <!-- Register Modal -->
  <div class="modal-overlay" :class="{ show: props.showRegister }">
    <div class="modal register-modal">
      <div class="modal-header">
        <h3>Create Account</h3>
        <button class="close-modal" @click="closeRegisterModal" aria-label="Close modal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
      <div class="modal-content">
        <div class="form-group">
          <label for="register-name">Full Name</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              class="input-icon"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <input
              type="text"
              id="register-name"
              v-model="name"
              placeholder="John Smith"
              autocomplete="name"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="register-email">Email</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              class="input-icon"
            >
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
            <input
              type="email"
              id="register-email"
              v-model="email"
              placeholder="yourname@example.com"
              autocomplete="email"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="register-password">Password</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              class="input-icon"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              />
            </svg>
            <input
              type="password"
              id="register-password"
              v-model="password"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="register-confirm-password">Confirm Password</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              class="input-icon"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              />
            </svg>
            <input
              type="password"
              id="register-confirm-password"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              autocomplete="new-password"
            />
          </div>
        </div>
        <button class="auth-button" @click="handleRegister">Create Account</button>
        <p class="auth-switch">
          Already have an account? <a href="#" @click.prevent="switchToLogin">Sign In</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition:
    backdrop-filter 0.3s ease,
    background-color 0.3s ease;
}

.modal-overlay.show {
  display: flex;
  animation: modalFadeIn 0.4s ease;
}

.modal {
  transform: scale(0.95);
  opacity: 0;
  transition:
    transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.3s ease;
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-overlay.show .modal {
  transform: scale(1);
  opacity: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 700;
}

.close-modal {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: all 0.2s ease;
  padding: 8px;
  line-height: 1;
}

.close-modal:hover {
  color: var(--primary-color);
  transform: rotate(90deg);
}

.close-modal:active {
  transform: scale(0.9) rotate(90deg);
}

.modal-content {
  padding-top: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #6c757d;
}

.form-group input {
  width: 100%;
  padding: 12px 16px 12px 46px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1);
  background-color: white;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #f8f9fa;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #e9ecef;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-password {
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.forgot-password:hover {
  text-decoration: underline;
  color: var(--accent-color);
}

.auth-button {
  width: 100%;
  padding: 14px;
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

.auth-switch {
  margin-top: 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.auth-switch a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.auth-switch a:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal {
    padding: 24px 20px;
    max-width: 90%;
    max-height: 80vh;
  }

  .modal-header h3 {
    font-size: 20px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group input {
    padding: 10px 16px 10px 46px;
    font-size: 14px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .auth-button {
    padding: 12px;
    font-size: 15px;
  }

  .auth-switch {
    font-size: 13px;
  }
}
</style>
