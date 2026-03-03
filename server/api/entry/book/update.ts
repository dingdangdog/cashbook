import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/book/update:
 *   post:
 *     summary: 更新账本信息
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             bookName: string 账本名称
 *             budget: number 预算金额
 *     responses:
 *       200:
 *         description: 账本更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Book 更新后的账本信息
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find bookID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { bookName, budget, bookId } = body;
  if (!bookId) {
    return error("Not Find bookID");
  }
  const updated = await prisma.book.updateMany({
    where: { bookId },
    data: {
      bookName,
      budget: Number(budget || 0),
    },
  });
  return success(updated);
});
