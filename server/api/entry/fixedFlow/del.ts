import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/fixedFlow/del:
 *   post:
 *     summary: 删除固定流水
 *     tags: ["Fixed Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 固定流水ID
 *     responses:
 *       200:
 *         description: 固定流水删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: 
 *                 d: FixedFlow 删除的固定流水信息
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"请先选择账本" | "Not Find ID"）
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;
  const id = body.id;

  if (!id) {
    return error("Not Find ID");
  }
  const deleted = await prisma.fixedFlow.delete({
    where: { id, bookId },
  });

  return success(deleted);
});
