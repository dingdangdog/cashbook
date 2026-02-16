import type { Prisma } from "~~/prisma/generated/client";

export function resolveFlowAccountDelta(input: {
  flowType?: string | null;
  money?: number | null;
  accountDelta?: number | null;
}): number {
  const explicitDelta = Number(input.accountDelta);
  if (Number.isFinite(explicitDelta)) {
    return explicitDelta;
  }

  const amount = Math.abs(Number(input.money ?? 0));
  if (!Number.isFinite(amount) || amount === 0) {
    return 0;
  }

  if (input.flowType === "收入") {
    return amount;
  }
  if (input.flowType === "支出") {
    return -amount;
  }
  return 0;
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

  const updated = await tx.fundAccount.update({
    where: { id: accountId },
    data: {
      currentBalance: nextBalance,
      totalIncome: Number(account.totalIncome || 0) + incomeDelta,
      totalExpense: Number(account.totalExpense || 0) + expenseDelta,
      lastFlowAt: input.flowDay || new Date(),
    },
  });

  return { accountBal: updated.currentBalance };
}
