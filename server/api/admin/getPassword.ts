// 退出登录
export default defineEventHandler(async (event) => {
  // const Authorization = getHeader(event, "Admin");
  const body = await readBody(event);
  const newPassword = encryptBySHA256(body.username, body.password);
  return success(newPassword);
});
