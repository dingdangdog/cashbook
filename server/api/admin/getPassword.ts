/**
 * @swagger
 * /api/admin/getPassword:
 *   post:
 *     summary: 生成管理员密码哈希
 *     tags: ["Admin"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 原始密码
 *     responses:
 *       200:
 *         description: 密码哈希生成成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 加密后的密码哈希
 *               }
 */
export default defineEventHandler(async (event) => {
  // const Authorization = getHeader(event, "Admin");
  const body = await readBody(event);
  const newPassword = encryptBySHA256(
    String(body.username).trim(),
    String(body.password).trim()
  );
  return success(newPassword);
});
