import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Login from '@/views/Login.vue'
import Chat from '@/views/Chat.vue'
import Account from '@/views/Account.vue'
import News from '@/views/News.vue'
import NewsDetail from '@/views/NewsDetail.vue'
import CreateNews from '@/views/CreateNews.vue'
import ManifestoSocial from '@/views/ManifestoSocial.vue'
import { useUserStore } from '@/stores/user'

// Не вызывайте store вне функции навигационной защиты
// const userStore = useUserStore()
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
  {
    path: '/manifesto',
    name: 'Manifesto',
    component: ManifestoSocial,
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

  // Используем useUserStore внутри навигационной защиты
  const userStore = useUserStore()
  // Здесь будет проверка авторизации пользователя
  const isAuthenticated = userStore.hasUser()

  if (requiresAuth && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
