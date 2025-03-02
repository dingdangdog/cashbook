// 退出登录
export default defineEventHandler(async (event) => {
  // const Authorization = getHeader(event, "Admin");
  const body = await readBody(event);
  const newPassword = encryptBySHA256(
    String(body.username).trim(),
    String(body.password).trim()
  );
  return success(newPassword);
});
