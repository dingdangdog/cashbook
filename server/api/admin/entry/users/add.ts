import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/users/add:
 *   post:
 *     summary: 管理员添加用户
 *     tags: ["Admin Users"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             username: string 用户名
 *             name: string 用户姓名
 *             password: string 密码
 *             email: string 邮箱
 *     responses:
 *       200:
 *         description: 用户添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: User 创建的用户信息
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  const username = String(body.username);
  const name = String(body.name);
  const password = String(body.password);
  const email = String(body.email);
  const entryPassword = encryptBySHA256(username, password);
  // 在数据库中添加新数据
  const created = await prisma.user.create({
    data: {
      username,
      email,
      name,
      password: entryPassword,
    },
  });
  return success(created);
});
