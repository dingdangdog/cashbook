import { useToast } from "vue-toastification"

export const useAppToast = () => {
  if (process.client) {
    const toast = useToast()
    
    return {
      success: (message: string, options?: any) => {
        toast.success(message, {
          timeout: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options
        })
      },
      
      error: (message: string, options?: any) => {
        toast.error(message, {
          timeout: 4000, // 错误消息显示时间稍长
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options
        })
      },
      
      warning: (message: string, options?: any) => {
        toast.warning(message, {
          timeout: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options
        })
      },
      
      info: (message: string, options?: any) => {
        toast.info(message, {
          timeout: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          ...options
        })
      },
      
      clear: () => {
        toast.clear()
      }
    }
  }
  
  // 服务端渲染时返回空函数
  return {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    clear: () => {}
  }
} 