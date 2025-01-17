export interface AlertInfo {
  id: string;
  type: "success" | "info" | "warning" | "error" | undefined;
  message: string;
}

export const newAlert = ref<AlertInfo>({
  id: "alert" + 0,
  type: undefined,
  message: "",
});

export const alert = (
  type: "success" | "info" | "warning" | "error" | undefined,
  message: string
) => {
  newAlert.value.id = Math.random().toString();
  newAlert.value.type = type;
  newAlert.value.message = message;
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
