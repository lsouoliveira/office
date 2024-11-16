import { createWebHistory, createRouter } from 'vue-router'

import GameView from './views/GameView.vue'
import LoginView from './views/LoginView.vue'
import SignUpView from './views/SignUpView.vue'

const routes = [
  { path: '/', component: GameView, meta: { requiresAuth: true } },
  { path: '/login', component: LoginView, meta: { hideForAuth: true } },
  { path: '/signup', component: SignUpView, meta: { hideForAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')

    if (!token) {
      next({ path: '/login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

router.beforeEach((to, _, next) => {
  if (to.matched.some((record) => record.meta.hideForAuth)) {
    const token = localStorage.getItem('token')

    if (token) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
