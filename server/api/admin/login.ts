/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 管理员登录
 *     tags: ["Admin"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             account: string 管理员账号
 *             password: string 管理员密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   token: 管理员令牌
 *                 }
 *               }
 *       400:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "账号密码错误"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { account, password } = body;

  // const entrypassword = encryptBySHA256(username || "", password || "");
  const adminpass = encryptBySHA256(account, password);
  const runtimeConfig = useRuntimeConfig();
  if (
    runtimeConfig.adminUsername == account &&
    runtimeConfig.adminPassword == adminpass
  ) {
    // 二次加密用作token，TODO 可以优化为使用JWT生成
    const adminToken = encryptBySHA256(account, adminpass);

    setCookie(event, "Admin", adminToken, {
      maxAge: 7 * 24 * 60 * 60,
    });

    return success({ token: adminToken });
  } else {
    return error("账号密码错误");
  }
});
