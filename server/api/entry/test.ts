import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/test:
 *   get:
 *     summary: 测试接口
 *     tags: ["Test"]
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: 测试成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[User用户列表数据]
 *               }
 */
export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany();
  console.log("users", users);
  return success(users);
});
