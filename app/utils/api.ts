import { Alert } from "./alert";
import type { Result, UserInfo } from "./model";
import { GlobalUserInfo } from "./store";

const API_PREFIEX = "/";

// 调用后端接口统一封装，节省Header处理
export const doApi = {
  // get 常用于获取公开数据
  get: async <T>(path: string, query?: any): Promise<T> => {
    const res = await $fetch<Result<T>>(`${API_PREFIEX}${path}`, {
      method: "GET",
      query: query,
      headers: getHeaders(),
      credentials: "include",
    });

    return intercepterResponse(res);
  },
  // post 用于大部分业务接口调用
  post: async <T>(path: string, data?: any): Promise<T> => {
    const res = await $fetch<Result<T>>(`${API_PREFIEX}${path}`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json;chartset=utf-8",
      },
      body: data,
      credentials: "include",
    });
    return intercepterResponse(res);
  },

  // postform 常用于上传文件
  postform: async <T>(path: string, data: FormData): Promise<T> => {
    // const formData = new FormData();
    // for (let key in data) {
    //   formData.append(key, data[key]);
    // }
    const res = await $fetch<Result<T>>(`${API_PREFIEX}${path}`, {
      method: "POST",
      // postform 使用默认header，如果有问题，建议自行尝试添加 'Content-Type': 'multipart/form-data'
      headers: getHeaders(),
      body: data,
    });
    return intercepterResponse(res);
  },

  // download 常用于获取文件，返回结果一般是文件流，常用于实现下载文件、展示图片等功能
  download: async (path: string, query?: any): Promise<any> => {
    return await $fetch(`${API_PREFIEX}${path}`, {
      method: "GET",
      query: query,
      responseType: "blob",
      headers: getHeaders(),
    });
  },
};

const intercepterResponse = <T>(res: Result<T>): T => {
  if (res.c == 200) {
    return res.d;
  } else {
    if (res.c == 400) {
      // 清除登陆状态（@sidebase/nuxt-auth框架）
      // useAuth().signOut();
      const route = useRoute();
      navigateTo({
        path: "/auth/login",
        query: { callbackUrl: route.fullPath },
      });
    }
    Alert.error(res.m);
    throw Error(res.m);
  }
};

const getHeaders = () => {
  return {
    Authorization: useCookie("Authorization").value || "",
    Admin: useCookie("Admin").value || "",
  };
};

export const getUserInfo = async () => {
  try {
    const user = await doApi.get<UserInfo>("api/entry/user/info");

    if (user) {
      GlobalUserInfo.value = user;
      return user;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};
