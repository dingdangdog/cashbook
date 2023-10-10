import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CalendarView from '@/views/CalendarView.vue'
import FlowsView from '@/views/FlowsView.vue'
import DictView from '@/views/DictView.vue'
import BooksView from '@/views/BooksView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: CalendarView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/flows',
      name: 'flows',
      component: FlowsView
    },
    {
      path: '/dict',
      name: 'dict',
      component: DictView
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: AboutView
    }
  ]
})

export default router
