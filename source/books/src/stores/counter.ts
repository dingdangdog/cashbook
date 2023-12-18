import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
const setting = {
  background: ''
}
export const getSystemBackground: any = () => {
  return setting.background
}

export const setSystemBackground = (url: string) => {
  setting.background = url
}

export const userInfo = ref({
  userId : localStorage.getItem('userId') || 0,
  name: localStorage.getItem('name') || '',
  bookId: localStorage.getItem('bookId') || 0,
  bookName: localStorage.getItem('bookName') || '',
})
