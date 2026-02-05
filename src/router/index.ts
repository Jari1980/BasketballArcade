import { createRouter, createWebHistory } from 'vue-router'
import BasketballGame from '@/components/basketball/BasketballGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BasketballGame,
    }
  ],
})

export default router
