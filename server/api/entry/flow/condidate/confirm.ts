import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/condidate/confirm:
 *   post:
 *     summary: 确认候选平账记录
 *     tags: ["Candidate"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             outId: number 支出记录ID
 *             inIds: number[] 收入记录ID数组
 *     responses:
 *       200:
 *         description: 平账确认成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: 操作结果
 *       400:
 *         description: 确认失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Not Find ID" | "Not Find IDS"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const { outId, inIds } = body;
  if (!outId) {
    return error("Not Find ID");
  }
  if (!inIds) {
    return error("Not Find IDS");
  }
  await prisma.flow.updateMany({
    where: { id: outId, userId },
    data: {
      eliminate: 1,
      flowType: "不计收支",
    },
  });
  for (const id of inIds) {
    await prisma.flow.updateMany({
      where: { id: Number(id), userId },
      data: {
        eliminate: 1,
        flowType: "不计收支",
      },
    });
  }
  return success();
});
