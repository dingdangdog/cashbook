import prisma from "~~/server/lib/prisma";
import {
  recalcFundAccountFromFlows,
  resolveFlowAccountDelta,
} from "~~/server/utils/db";

/**
 * @swagger
 * /api/entry/flow/update:
 *   post:
 *     summary: 更新流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 流水ID
 *             day: string 日期
 *             flowType: string 流水类型（收入、支出）
 *             industryType: string 行业分类
 *             payType: string 支付方式
 *             name: string 流水名称
 *             money: number 金额
 *             description: string 描述
 *             attribution: string 归属
 *     responses:
 *       200:
 *         description: 流水记录更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Flow 更新后的流水记录
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
  const body = await readBody(event);
  if (!body.id) {
    return error("Not Find ID");
  }
  const flow = {
    ...(body.day != null && body.day !== "" && { day: new Date(body.day) }),
    flowType: String(body.flowType || ""), // 流水类型：收入、支出
    industryType: String(body.industryType || ""), // 行业分类 原 type（收入类型、支出类型）
    payType: String(body.payType || ""), // 支付方式
    money: Number(body.money || ""),
    name: String(body.name || ""),
    description: String(body.description || ""),
    attribution: String(body.attribution || ""),
    accountId:
      body.accountId !== undefined
        ? body.accountId
          ? Number(body.accountId)
          : null
        : undefined,
    accountDelta:
      body.accountDelta !== undefined && body.accountDelta !== null
        ? Number(body.accountDelta)
        : undefined,
  };
  const userId = await getUserId(event);
  const row = await prisma.$transaction(async (tx) => {
    const oldRow = await tx.flow.findFirst({
      where: { id: Number(body.id), userId },
    });
    if (!oldRow) {
      return null;
    }

    const oldAccountId = oldRow.accountId ?? undefined;
    const nextAccountId =
      flow.accountId !== undefined ? flow.accountId : oldRow.accountId;
    const nextFlowType = flow.flowType ?? oldRow.flowType ?? "";
    const nextMoney =
      flow.money !== undefined && flow.money !== null
        ? flow.money
        : oldRow.money;
    const nextDay = flow.day ?? oldRow.day;
    const nextDelta = resolveFlowAccountDelta({
      flowType: nextFlowType,
      money: Number(nextMoney || 0),
      accountDelta: flow.accountDelta,
    });

    const updated = await tx.flow.update({
      where: { id: Number(body.id) },
      data: {
        ...flow,
        accountId: nextAccountId,
        accountDelta: nextAccountId != null ? nextDelta : null,
        accountBal: null,
      },
    });

    await recalcFundAccountFromFlows(oldAccountId, tx);
    const newAccountId = updated.accountId ?? undefined;
    if (newAccountId !== oldAccountId) {
      await recalcFundAccountFromFlows(newAccountId, tx);
    }
    return updated;
  });
  if (!row) {
    return error("Not Find ID");
  }
  return success(row);
});
