import type { Result } from "~/utils/model";
import type { UserInfo } from "~/utils/model";

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  // 已有用户信息（例如刚登录成功）则直接放行
  if (userStore.user) return;

  if (!userStore.user) {
    const { data: res, error } = await useFetch<Result<UserInfo>>(
      "/api/entry/user/info",
      {
        method: "get",
        credentials: "include",
      },
    );
    if (error.value) {
      return navigateTo({ path: "/500", query: { e: String(error.value) } });
    }
    if (res.value?.c === 200 && res.value.d) {
      userStore.setUser(res.value.d);
      return;
    }
    userStore.clearUser();
    if (res.value?.c === 400) {
      return navigateTo({
        path: "/login",
        query: { callbackUrl: to.fullPath },
      });
    }
    return navigateTo({
      path: "/login",
      query: { callbackUrl: to.fullPath },
    });
  }
  return;
});
