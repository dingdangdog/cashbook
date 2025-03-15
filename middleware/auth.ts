// 登录过滤
export default defineNuxtRouteMiddleware(async (to, from) => {
  // 需要登陆的地址，校验登陆状态
  // const token = useCookie("Authorization").value;
  const { data: res, error } = await useFetch<Result<UserInfo>>(
    "/api/checkuser",
    {
      method: "get",
      headers: {
        Authorization: useCookie("Authorization").value || "",
      },
    }
  );
  // console.log("res", res, "error", error);
  if (error.value) {
    return navigateTo({ path: "/500", query: { e: String(error.value) } });
  }
  if (!res.value?.d) {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("bookName");
    localStorage.removeItem("bookId");
    Alert.error("用户异常，请重新登录！");
    return navigateTo({ path: "/login", query: { callbackUrl: to.fullPath } });
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
      path: "/login",
      query: { callbackUrl: to.fullPath },
    });
  } else {
    return navigateTo({ path: "/500", query: { e: JSON.stringify(res) } });
  }
});
