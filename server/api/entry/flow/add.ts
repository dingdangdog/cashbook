import prisma from "~~/server/lib/prisma";
import {
  recalcFundAccountFromFlows,
  resolveFlowAccountDelta,
  normalizeFlowTypeLabel,
} from "~~/server/utils/db";

/**
 * @swagger
 * /api/entry/flow/add:
 *   post:
 *     summary: 添加流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
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
 *         description: 流水记录添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Flow 流水记录信息
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  const userId = await getUserId(event);
  const flowType = String(body.flowType || "");
  const normalizedType = normalizeFlowTypeLabel(flowType);
  const rawMoney = Number(body.money || "");
  const money =
    normalizedType === "收入" || normalizedType === "支出"
      ? Math.abs(rawMoney)
      : rawMoney;
  const flow = {
    userId: userId,
    day: body.day ? new Date(body.day) : new Date(),
    flowType, // 流水类型：收入、支出
    industryType: String(body.industryType || ""), // 行业分类 原 type（收入类型、支出类型）
    payType: String(body.payType || ""), // 支付方式
    name: String(body.name || ""),
    money,
    description: String(body.description || ""),
    // invoice: String(body.invoice || ""),
    attribution: String(body.attribution || ""),
    flowNo: getUUID(10),
    accountId: body.accountId ? Number(body.accountId) : null,
    accountDelta:
      body.accountDelta !== undefined && body.accountDelta !== null
        ? Number(body.accountDelta)
        : null,
  };

  const created = await prisma.$transaction(async (tx) => {
    const delta = resolveFlowAccountDelta({
      flowType: flow.flowType,
      money: flow.money,
      accountDelta: flow.accountDelta,
    });
    const row = await tx.flow.create({
      data: {
        ...flow,
        accountDelta: flow.accountId ? delta : null,
        accountBal: null,
      },
    });
    await recalcFundAccountFromFlows(flow.accountId ?? undefined, tx);
    return row;
  });
  return success(created);
});
