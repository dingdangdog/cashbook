import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 通用的ESC键监听组合式函数
 * @param callback ESC键按下时的回调函数
 * @param isActive 是否激活监听，默认为true
 */
export function useEscapeKey(callback: () => void, isActive: boolean | Ref<boolean> = true) {
  const handleEscape = (event: KeyboardEvent) => {
    const active = typeof isActive === 'boolean' ? isActive : isActive.value
    if (active && event.key === 'Escape') {
      event.preventDefault()
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleEscape)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })

  return {
    handleEscape
  }
}