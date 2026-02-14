import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/condidate/ignore:
 *   post:
 *     summary: 忽略候选平账记录
 *     tags: ["Candidate"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 流水记录ID
 *     responses:
 *       200:
 *         description: 忽略成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Flow 更新后的记录信息
 *       400:
 *         description: 忽略失败
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
  const updated = await prisma.flow.update({
    where: { id, bookId },
    data: {
      eliminate: -1,
    },
  });
  return success(updated);
});
