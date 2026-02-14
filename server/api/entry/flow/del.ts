import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/del:
 *   post:
 *     summary: 删除流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 流水ID
 *             bookId: string 账本ID
 *     responses:
 *       200:
 *         description: 流水记录删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Flow 删除的流水记录信息
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body.id;
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;

  if (!id) {
    return error("Not Find ID");
  }
  const deleted = await prisma.flow.delete({
    where: { id, bookId },
  });

  return success(deleted);
});
