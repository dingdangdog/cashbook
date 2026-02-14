import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/condidate/ignoreAll:
 *   post:
 *     summary: 批量忽略候选平账记录
 *     tags: ["Candidate"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             ids: number[] 流水记录ID数组
 *     responses:
 *       200:
 *         description: 批量忽略成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: number 更新的记录数量
 *               }
 *       400:
 *         description: 忽略失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Not Find ID" | "无数据"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const ids = body.ids as number[] | undefined;
  if (!ids) {
    return error("Not Find ID");
  }
  if (ids.length <= 0) {
    return error("无数据");
  }
  const updated = await prisma.flow.updateMany({
    where: { id: { in: ids } },
    data: { eliminate: -1 },
  });

  return success(updated.count);
});
