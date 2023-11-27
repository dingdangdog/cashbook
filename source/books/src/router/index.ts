import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CalendarView from '@/views/CalendarView.vue'
import FlowsView from '@/views/FlowsView.vue'
import DictView from '@/views/DictView.vue'
import BooksView from '@/views/BooksView.vue'
import SystemView from '@/views/SystemView.vue'
import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'

const checkAuth = () => {
  const isAuth = false
  return !isAuth
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: CalendarView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
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
      path: '/system',
      name: 'system',
      component: SystemView
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

// how make loginView under the router-view
router.beforeEach((to, from, next) => {
  console.log('to', to)
  // console.log('checkAuth', checkAuth)
  if (to.name !== 'login' && checkAuth()) {
    // next({ name: 'login' })
    // use another way to redirect
    router.push({ name: 'login' })
  }
  else next()
})


export default router
