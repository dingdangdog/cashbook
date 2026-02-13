import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/checkuser:
 *   get:
 *     summary: 检查用户登录状态
 *     tags: ["Base"]
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: 用户信息获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   id: 用户ID,
 *                   name: 用户姓名,
 *                   username: 用户名,
 *                   createAt: 创建日期
 *                 }
 *               }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      roles: true,
      createAt: true,
      lightTheme: true,
      darkTheme: true,
    },
    where: { id: userId },
  });

  if (!user) {
    deleteCookie(event, "Authorization");
    return success(null);
  }

  return success(user);
});
