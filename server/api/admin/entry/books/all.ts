import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/books/all:
 *   get:
 *     summary: 管理员获取所有账本
 *     tags: ["Admin Books"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 账本列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [账本列表数组]
 *               }
 */
export default defineEventHandler(async (event) => {
  const books = await prisma.book.findMany();
  return success(books);
});
