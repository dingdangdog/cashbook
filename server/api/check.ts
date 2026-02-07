import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/check:
 *   get:
 *     summary: 获取用户数量
 *     tags: ["Base"]
 *     responses:
 *       200:
 *         description: 用户数量获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 用户数量：-1为获取失败，一般表示数据库链接有问题
 *               }
 */
export default defineEventHandler(async (event) => {
  try {
    const userCount = await prisma.user.count();
    return success(userCount);
  } catch (error) {
    console.error("Failed to get user count:", error);
    return success(-1);
  }
});
