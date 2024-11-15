import { createWebHistory, createRouter } from 'vue-router'

import LoginView from './views/LoginView.vue'
import SignUpView from './views/SignUpView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/signup', component: SignUpView }
]

const router = createRouter({
    history: createWebHistory(),
  routes
})

export default router
