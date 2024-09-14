import { ref } from 'vue'

// const AlertType  type of "success" | "info" | "warning" | "error" | undefined

export interface AlertInfo {
  id: string
  type: 'success' | 'info' | 'warning' | 'error' | undefined
  message: string
}

export const newAlert = ref<AlertInfo>({
  id: 'alert' + 0,
  type: undefined,
  message: ''
})

export const alert = (
  type: 'success' | 'info' | 'warning' | 'error' | undefined,
  message: string
) => {
  newAlert.value.id = Math.random().toString()
  newAlert.value.type = type
  newAlert.value.message = message
}

export const errorAlert = (message: string) => {
  alert('error', message)
}

export const successAlert = (message: string) => {
  alert('success', message)
}

export const infoAlert = (message: string) => {
  alert('info', message)
}

export const warningAlert = (message: string) => {
  alert('warning', message)
}
