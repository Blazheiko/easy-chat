import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Login from '@/views/Login.vue'
import Chat from '@/views/Chat.vue'
import Account from '@/views/Account.vue'
import News from '@/views/News.vue'
import NewsDetail from '@/views/NewsDetail.vue'
import CreateNews from '@/views/CreateNews.vue'

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
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: { requiresAuth: true },
  },
  {
    path: '/news/create',
    name: 'CreateNews',
    component: CreateNews,
    meta: { requiresAuth: true },
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: NewsDetail,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
