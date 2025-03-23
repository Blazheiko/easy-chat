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
</script>

<template>
  <!-- Login Modal -->
  <div class="modal-overlay" :class="{ show: props.showLogin }">
    <div class="modal login-modal">
      <div class="modal-header">
        <h3>Sign In</h3>
        <button class="close-modal" @click="closeLoginModal">×</button>
      </div>
      <div class="modal-content">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" placeholder="Your email" />
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" placeholder="Your password" />
        </div>
        <button class="auth-button">Sign In</button>
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
        <h3>Register</h3>
        <button class="close-modal" @click="closeRegisterModal">×</button>
      </div>
      <div class="modal-content">
        <div class="form-group">
          <label for="register-name">Name</label>
          <input type="text" id="register-name" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label for="register-email">Email</label>
          <input type="email" id="register-email" placeholder="Your email" />
        </div>
        <div class="form-group">
          <label for="register-password">Password</label>
          <input type="password" id="register-password" placeholder="Your password" />
        </div>
        <div class="form-group">
          <label for="register-confirm-password">Confirm Password</label>
          <input type="password" id="register-confirm-password" placeholder="Confirm password" />
        </div>
        <button class="auth-button">Register</button>
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
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 100;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition:
    backdrop-filter 0.3s ease,
    background-color 0.3s ease;
}

.modal-overlay.show {
  display: flex;
  animation: modalFadeIn 0.3s ease;
}

.modal {
  transform: scale(0.95);
  opacity: 0;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  position: relative;
}

.modal-overlay.show .modal {
  transform: scale(1);
  opacity: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.modal-header h3 {
  margin: 0;
  color: #003399;
}

.close-modal {
  position: absolute;
  right: -15px;
  top: -15px;
  background: #f0f0f0;
  border: none;
  font-size: 24px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
  border: 1px solid #ddd;
  padding: 0;
  line-height: 1;
}

.close-modal:hover {
  background-color: #e0e0e0;
  color: #333;
}

.close-modal:active {
  transform: scale(0.9);
}

.modal-content {
  padding-top: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 2px solid #003399;
  border-radius: 5px;
  outline: none;
}

.form-group input:focus {
  box-shadow: 0 0 5px rgba(0, 51, 153, 0.3);
}

.auth-button {
  width: 100%;
  padding: 12px;
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

.switch-form {
  margin-top: 15px;
  text-align: center;
  color: #666;
}

.switch-form a {
  color: #003399;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.switch-form a:hover {
  text-decoration: underline;
}

.switch-form a:active {
  color: #001e66;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
}
</style>
