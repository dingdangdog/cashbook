// 登录过滤
export default defineNuxtRouteMiddleware((to, from) => {
  // 需要登陆的地址，校验登陆状态
  const token = useCookie("Admin").value;
  // console.log(token);
  if (!token) {
    return navigateTo({ path: `/admin/login` });
  }
  return;
});
