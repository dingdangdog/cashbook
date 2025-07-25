import prisma from "~/lib/prisma";

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
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // const userId = await getUserId(event);
  const { id, bookId } = body;
  if (!id || !bookId) {
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
