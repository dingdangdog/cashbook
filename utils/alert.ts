import { useToast } from "vue-toastification"

export interface AlertInfo {
  id: string;
  type: "success" | "info" | "warning" | "error" | undefined;
  message: string;
}

// 保持向后兼容性，但这些现在不再使用
export const newAlert = ref<AlertInfo>({
  id: "alert" + 0,
  type: undefined,
  message: "",
});

export const alert = (
  type: "success" | "info" | "warning" | "error" | undefined,
  message: string
) => {
  if (process.client) {
    const toast = useToast()
    
    const options = {
      timeout: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }

    switch (type) {
      case "success":
        toast.success(message, options)
        break
      case "error":
        toast.error(message, options)
        break
      case "warning":
        toast.warning(message, options)
        break
      case "info":
        toast.info(message, options)
        break
      default:
        toast(message, options)
        break
    }
  }
};

export class Alert {
  static error = (message?: string) => {
    alert("error", message || "错误信息");
  };

  static success = (message?: string) => {
    alert("success", message || "成功信息");
  };

  static info = (message?: string) => {
    alert("info", message || "提示信息");
  };

  static warning = (message?: string) => {
    alert("warning", message || "警告信息");
  };
}
