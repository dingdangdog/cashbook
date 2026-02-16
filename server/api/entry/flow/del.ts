import prisma from "~~/server/lib/prisma";
import { applyFlowAccountDelta } from "~~/server/utils/db";

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
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const id = body.id;

  if (!id) {
    return error("Not Find ID");
  }
  const row = await prisma.flow.findFirst({
    where: { id: Number(id), userId },
  });
  if (!row) {
    return error("Not Find ID");
  }
  const deleted = await prisma.$transaction(async (tx) => {
    if (row.accountId && row.accountDelta) {
      await applyFlowAccountDelta(tx, {
        userId,
        accountId: row.accountId,
        delta: -Number(row.accountDelta),
        flowDay: row.day,
      });
    }
    return tx.flow.delete({
      where: { id: Number(id) },
    });
  });
  return success(deleted);
});
