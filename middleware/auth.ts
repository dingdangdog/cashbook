// 登录过滤
export default defineNuxtRouteMiddleware(async (to, from) => {
  // 需要登陆的地址，校验登陆状态
  // const token = useCookie("Authorization").value;
  const { data: res, error } = await useFetch<Result<UserInfo>>(
    "/api/entry/user/info",
    {
      method: "get",
    }
  );
  if (error.value) {
    return navigateTo({ path: "/500", query: { e: String(error.value) } });
  }
  // console.log(res);
  // 用户信息获取成功，正常跳转
  if (res.value && res.value.c == 200 && res.value.d) {
    GlobalUserInfo.value = res.value.d;
    return;
  } else if (res.value && res.value.c == 400) {
    // console.log(400);
    // 跳转登录
    return navigateTo({
      path: "/auth/login",
      query: { callbackUrl: to.fullPath },
    });
  } else {
    return navigateTo({ path: "/500", query: { e: JSON.stringify(res) } });
  }
});
