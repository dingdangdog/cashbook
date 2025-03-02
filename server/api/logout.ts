// 退出登录
export default defineEventHandler(async (event) => {
  // const Authorization = getHeader(event, "Admin");

  deleteCookie(event, "Authorization");

  return success("退出成功");
});
