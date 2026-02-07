import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/users/del:
 *   post:
 *     summary: 管理员删除用户
 *     tags: ["Admin Users"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 用户ID
 *     responses:
 *       200:
 *         description: 用户删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: User 删除的用户信息
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const { id } = await readBody(event); // 从请求体获取 ID
  if (!id) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.user.delete({
    where: { id: Number(id) },
  });

  return success(deleted);
});
