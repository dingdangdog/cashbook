const API_PREFIEX = "/api";

// 调用后端接口统一封装，节省Header处理
export const doApi = {
  get: <T>(path: string): Promise<T> => {
    // @ts-ignore
    return $fetch<T>(`${API_PREFIEX}${path}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });
  },
  post: <T>(path: string, data: any): Promise<T> => {
    // @ts-ignore
    return $fetch<T>(`${API_PREFIEX}${path}`, {
      method: "POST",
      headers: getHeaders(),
      body: data,
      credentials: "include",
    });
  },
};

const getHeaders = () => {
  return {
    Authorization: useCookie("Authorization").value || "",
  };
};
