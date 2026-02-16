import prisma from "~~/server/lib/prisma";
import { recalcFundAccountFromFlows } from "~~/server/utils/db";

/**
 * @swagger
 * /api/entry/flow/dels:
 *   post:
 *     summary: 批量删除流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             ids: number[] 流水ID数组
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: number 删除的记录数量
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
  const ids = body.ids;

  if (!ids) {
    return error("Not Find ID");
  }
  const deleted = await prisma.$transaction(async (tx) => {
    const rows = await tx.flow.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
    const accountIds = new Set<number>();
    for (const row of rows) {
      if (row.accountId) accountIds.add(row.accountId);
    }
    const result = await tx.flow.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
    for (const accountId of accountIds) {
      await recalcFundAccountFromFlows(accountId, tx);
    }
    return result;
  });
  return success(deleted);
});
