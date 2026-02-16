import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";

export function normalizeFlowTypeLabel(
  flowType?: string | null,
): "收入" | "支出" | "不计收支" | null {
  const text = String(flowType ?? "").trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  if (text === "收入" || text.includes("收入") || /^收/.test(text))
    return "收入";
  if (
    lower === "income" ||
    lower === "inflow" ||
    lower === "earning" ||
    lower === "earnings" ||
    lower === "revenue"
  ) {
    return "收入";
  }
  if (
    text === "支出" ||
    text.includes("支出") ||
    /^支/.test(text) ||
    text.includes("花") ||
    text.includes("消费")
  ) {
    return "支出";
  }
  if (
    lower === "expense" ||
    lower === "spend" ||
    lower === "spending" ||
    lower === "outflow" ||
    lower === "cost"
  ) {
    return "支出";
  }
  if (
    text === "不计收支" ||
    text.includes("不计收支") ||
    text.includes("转账") ||
    text.includes("平账")
  ) {
    return "不计收支";
  }
  if (
    lower === "transfer" ||
    lower === "internal_transfer" ||
    lower === "balance" ||
    lower === "neutral"
  ) {
    return "不计收支";
  }
  return null;
}

export function resolveFlowAccountDelta(input: {
  flowType?: string | null;
  money?: number | null;
  accountDelta?: number | null;
}): number {
  const explicitDelta = Number(input.accountDelta);
  if (Number.isFinite(explicitDelta)) {
    return explicitDelta;
  }

  const rawMoney = Number(input.money ?? 0);
  const amount = Math.abs(rawMoney);
  if (!Number.isFinite(amount) || amount === 0) {
    return 0;
  }

  const normalizedFlowType = normalizeFlowTypeLabel(input.flowType);
  if (normalizedFlowType === "收入") {
    return amount;
  }
  if (normalizedFlowType === "支出") {
    return -amount;
  }
  if (normalizedFlowType === "不计收支") {
    return 0;
  }
  // 兜底：类型无法识别时，沿用金额符号。
  return rawMoney < 0 ? -amount : amount;
}

export async function applyFlowAccountDelta(
  tx: Prisma.TransactionClient,
  input: {
    userId: number;
    accountId?: number | null;
    delta: number;
    flowDay?: Date | null;
  },
): Promise<{ accountBal: number | null }> {
  const accountId = input.accountId;
  if (!accountId) {
    return { accountBal: null };
  }

  const account = await tx.fundAccount.findFirst({
    where: { id: accountId, userId: input.userId },
  });
  if (!account) {
    throw new Error("资金账户不存在或无权限");
  }

  const delta = Number(input.delta || 0);
  const nextBalance = Number(account.currentBalance || 0) + delta;
  const incomeDelta = delta > 0 ? delta : 0;
  const expenseDelta = delta < 0 ? Math.abs(delta) : 0;
  const nextTotalIncome = Number(account.totalIncome || 0) + incomeDelta;
  const nextTotalExpense = Number(account.totalExpense || 0) + expenseDelta;
  const nextTotalProfit = nextTotalIncome - nextTotalExpense;
  const nextTotalLiability = Math.max(0, -nextBalance);

  const updated = await tx.fundAccount.update({
    where: { id: accountId },
    data: {
      currentBalance: nextBalance,
      totalIncome: nextTotalIncome,
      totalExpense: nextTotalExpense,
      totalProfit: nextTotalProfit,
      totalLiability: nextTotalLiability,
      lastFlowAt: input.flowDay || new Date(),
    },
  });

  return { accountBal: updated.currentBalance };
}

/**
 * 根据该账户下全部流水全量重算资金账户的 currentBalance、totalIncome、totalExpense、lastFlowAt。
 * 流水变动（增/删/改）后调用，保证账户余额与流水一致；不维护每笔流水的 accountBal。
 * @param accountId 资金账户 ID，null/0 则直接返回
 * @param tx 可选，在已有事务中传入以复用
 */
export async function recalcFundAccountFromFlows(
  accountId: number | null | undefined,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const id =
    accountId != null && Number.isFinite(accountId) ? Number(accountId) : null;
  if (id == null || id <= 0) return;

  const client: Prisma.TransactionClient =
    tx ?? (prisma as unknown as Prisma.TransactionClient);

  const account = await client.fundAccount.findUnique({
    where: { id },
    select: { id: true, initialBalance: true },
  });
  if (!account) return;

  const [flows, lastFlow] = await Promise.all([
    client.flow.findMany({
      where: { accountId: id },
      select: { accountDelta: true, flowType: true, money: true },
    }),
    client.flow.findFirst({
      where: { accountId: id },
      orderBy: [{ day: "desc" }, { id: "desc" }],
      select: { day: true },
    }),
  ]);

  let sumDelta = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of flows) {
    const delta = resolveFlowAccountDelta({
      flowType: row.flowType,
      money: row.money,
      accountDelta: row.accountDelta,
    });
    sumDelta += delta;
    if (delta > 0) totalIncome += delta;
    if (delta < 0) totalExpense += Math.abs(delta);
  }
  const initialBalance = Number(account.initialBalance ?? 0);
  const currentBalance = initialBalance + sumDelta;
  const totalProfit = totalIncome - totalExpense;
  const totalLiability = Math.max(0, -currentBalance);

  await client.fundAccount.update({
    where: { id },
    data: {
      currentBalance,
      totalIncome,
      totalExpense,
      totalProfit,
      totalLiability,
      lastFlowAt: lastFlow?.day ?? null,
    },
  });
}
