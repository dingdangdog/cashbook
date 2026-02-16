import prisma from "~~/server/lib/prisma";
import {
  applyFlowAccountDelta,
  resolveFlowAccountDelta,
} from "~~/server/utils/db";

/**
 * @swagger
 * /api/entry/flow/updates:
 *   post:
 *     summary: 批量更新流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             ids: number[] 流水ID数组
 *             flowType: string 流水类型（可选）
 *             industryType: string 行业分类（可选）
 *             payType: string 支付方式（可选）
 *             attribution: string 归属（可选）
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: number 更新的记录数量
 *       400:
 *         description: 更新失败
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
  const { flowType, industryType, payType, attribution, accountId, accountDelta } =
    body;

  if (!ids) {
    return error("Not Find ID");
  }

  const updateInfo: any = {};
  if (flowType) {
    updateInfo.flowType = String(flowType);
  }
  if (industryType) {
    updateInfo.industryType = String(industryType);
  }
  if (payType) {
    updateInfo.payType = String(payType);
  }
  if (attribution) {
    updateInfo.attribution = String(attribution);
  }
  const hasAccountIdUpdate = accountId !== undefined;
  const nextAccountId =
    hasAccountIdUpdate ? (accountId ? Number(accountId) : null) : undefined;
  const hasAccountDeltaUpdate =
    accountDelta !== undefined && accountDelta !== null;
  const explicitAccountDelta = hasAccountDeltaUpdate ? Number(accountDelta) : null;

  const updated = await prisma.$transaction(async (tx) => {
    const rows = await tx.flow.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    let count = 0;
    for (const row of rows) {
      if (row.accountId && row.accountDelta) {
        await applyFlowAccountDelta(tx, {
          userId,
          accountId: row.accountId,
          delta: -Number(row.accountDelta),
          flowDay: row.day,
        });
      }

      const targetAccountId =
        nextAccountId !== undefined ? nextAccountId : row.accountId;
      const targetFlowType = updateInfo.flowType ?? row.flowType;
      const targetDelta = resolveFlowAccountDelta({
        flowType: targetFlowType,
        money: Number(row.money || 0),
        accountDelta: hasAccountDeltaUpdate ? explicitAccountDelta : undefined,
      });

      let targetAccountBal: number | null = null;
      if (targetAccountId) {
        const result = await applyFlowAccountDelta(tx, {
          userId,
          accountId: targetAccountId,
          delta: targetDelta,
          flowDay: row.day,
        });
        targetAccountBal = result.accountBal;
      }

      await tx.flow.update({
        where: { id: row.id },
        data: {
          ...updateInfo,
          accountId: targetAccountId,
          accountDelta: targetAccountId ? targetDelta : null,
          accountBal: targetAccountId ? targetAccountBal : null,
        },
      });
      count++;
    }

    return { count };
  });
  return success(updated);
});
