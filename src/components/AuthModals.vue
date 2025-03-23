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
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  padding: 32px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  position: relative;
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
  color: #1a73e8;
  font-size: 24px;
  font-weight: 700;
}

.close-modal {
  position: absolute;
  right: -12px;
  top: -12px;
  background: white;
  border: none;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0;
  line-height: 1;
}

.close-modal:hover {
  background-color: #f8f9fa;
  color: #1a73e8;
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

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  outline: none;
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-group input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1);
}

.auth-button {
  width: 100%;
  padding: 14px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
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

.auth-switch {
  margin-top: 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.auth-switch a {
  color: #1a73e8;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.auth-switch a:hover {
  color: #1765cc;
  text-decoration: underline;
}

.auth-switch a:active {
  color: #135cbb;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}
</style>
