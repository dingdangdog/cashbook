import { createRouter, createWebHistory } from 'vue-router'
import AnalyticsView from '@/views/AnalyticsView.vue'
import CalendarView from '@/views/CalendarView.vue'
import FlowsView from '@/views/FlowsView.vue'
import DictView from '@/views/DictView.vue'
import BooksView from '@/views/BooksView.vue'
import SystemView from '@/views/SystemView.vue'
import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import IndexView from '@/views/IndexView.vue'

const checkLoginIn = () => {
  const isLogin = localStorage.getItem('token')
  return isLogin
}


const publicRoutes= [
  {
    path: '/login',
    component: LoginView,
    hidden: true,
    meta: { public: true }
  },
  {
    path: '/',
    name: 'index',
    component: IndexView,
    children: [
      {
        path: '/',
        name: 'calendar',
        component: CalendarView
      },
      {
        path: '/analytics',
        name: 'analytics',
        component: AnalyticsView
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
        path: '/system',
        name: 'system',
        component: SystemView
      },
      {
        path: '/about',
        name: 'about',
        component: AboutView
      }
    ]
  },
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes]
})

router.beforeEach((to, from, next) => {
  console.log('to', to)
  if (!to.meta.public && !checkLoginIn()) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router;
