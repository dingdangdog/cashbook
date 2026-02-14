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
  const userId = await getUserId(event);
  const body = await readBody(event);
  const id = body.id;
  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.flow.updateMany({
    where: { id: Number(id), userId },
    data: {
      eliminate: -1,
    },
  });
  if (updated.count === 0) {
    return error("Not Find ID");
  }
  const row = await prisma.flow.findUnique({
    where: { id: Number(id) },
  });
  return success(row);
});
