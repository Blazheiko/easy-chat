import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import Chat from '../views/Chat.vue'
import Account from '../views/Account.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true },
  },
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Простая навигационная защита
router.beforeEach((to, from, next) => {
  // Проверяем, требует ли маршрут авторизации
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Здесь будет проверка авторизации пользователя
  // Пока используем имитацию - проверяем наличие данных в localStorage
  const isAuthenticated = localStorage.getItem('user') !== null

  if (requiresAuth && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
