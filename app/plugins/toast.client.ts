import Toast, { POSITION } from "vue-toastification"
import "vue-toastification/dist/index.css"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
    maxToasts: 5,
  })
}) 