import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/users/all:
 *   get:
 *     summary: 管理员获取所有用户
 *     tags: ["Admin Users"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 用户列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [用户列表数组]
 *               }
 */
export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany();
  return success(users);
});
