import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/user/info:
 *   get:
 *     summary: 获取用户信息
 *     tags: ["User"]
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: 用户信息获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d:
 *                   id: 用户ID,
 *                   name: 用户姓名,
 *                   username: 用户名,
 *                   createDate: 创建日期
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);

  const where: any = {
    id: userId,
  };

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      username: true,
      createDate: true,
    },
    where, // 使用条件查询
  });

  return success(user);
});
