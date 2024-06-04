import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '@/views/layout/IndexView.vue'

import LoginView from '@/views/pages/LoginView.vue'
import CalendarView from '@/views/pages/CalendarView.vue'
import AnalyticsView from '@/views/pages/AnalyticsView.vue'
import FlowsView from '@/views/pages/FlowsView.vue'
import BooksView from '@/views/pages/BooksView.vue'
import TypeView from '@/views/pages/TypeView.vue'
import SystemView from '@/views/pages/SystemView.vue'
import AboutView from '@/views/pages/AboutView.vue'

const checkLoginIn = () => {
  return localStorage.getItem('token')
}


const publicRoutes = [
  {
    path: '/login',
    component: LoginView,
    hidden: true,
    meta: { public: true }
  },
  {
    path: '/index',
    name: 'index',
    component: IndexView,
    children: [
      {
        path: '/index/',
        name: 'calendar',
        component: CalendarView
      },
      {
        path: '/index/analytics',
        name: 'analytics',
        component: AnalyticsView
      },
      {
        path: '/index/flows',
        name: 'flows',
        component: FlowsView
      },
      {
        path: '/index/books',
        name: 'books',
        component: BooksView
      },
      {
        path: '/index/type',
        name: 'type',
        component: TypeView
      },
      {
        path: '/index/system',
        name: 'system',
        component: SystemView
      },
      {
        path: '/index/about',
        name: 'about',
        component: AboutView
      }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: publicRoutes
})

router.beforeEach((to, from, next) => {
  // console.log('to', to)
  if (!to.meta.public && !checkLoginIn()) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
