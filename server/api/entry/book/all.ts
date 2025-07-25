import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/book/all:
 *   get:
 *     summary: 获取用户所有账本
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: 账本列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[Book账本列表数组]
 *               }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const books = await prisma.book.findMany({ where: { userId } });
  return success(books);
});
