import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/users/update:
 *   post:
 *     summary: 管理员更新用户信息
 *     tags: ["Admin Users"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 用户ID
 *             name: string 用户姓名（可选）
 *             username: string 用户名（可选，需要同时提供password）
 *             password: string 密码（可选，需要同时提供username）
 *             email: string 邮箱（可选）
 *     responses:
 *       200:
 *         description: 用户更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: User 更新后的用户信息
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, name, username, password, email } = body;
  if (!id) {
    return error("Not Find ID");
  }
  const data: any = {};
  if (name) {
    data.name = name;
  }
  if (email) {
    data.email = email;
  }
  if (username && password) {
    data.username = username;
    data.password = encryptBySHA256(username, password);
  }
  // data.update
  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: data,
  });
  return success(updated);
});
