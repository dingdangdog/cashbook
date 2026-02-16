import prisma from "~~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);

  const name = String(body.name || "").trim();
  const accountType = String(body.accountType || "").trim();
  if (!name) {
    return error("账户名称不能为空");
  }
  if (!accountType) {
    return error("账户类型不能为空");
  }

  const initialBalance = Number(body.initialBalance ?? 0);
  const currentBalance =
    body.currentBalance !== undefined && body.currentBalance !== null
      ? Number(body.currentBalance)
      : initialBalance;

  const created = await prisma.fundAccount.create({
    data: {
      userId,
      name,
      accountType,
      institution: body.institution ? String(body.institution) : null,
      accountNo: body.accountNo ? String(body.accountNo) : null,
      currency: body.currency ? String(body.currency) : "CNY",
      initialBalance,
      currentBalance,
      totalIncome: Number(body.totalIncome ?? 0),
      totalExpense: Number(body.totalExpense ?? 0),
      totalLiability: Number(body.totalLiability ?? 0),
      totalProfit: Number(body.totalProfit ?? 0),
      status:
        body.status !== undefined && body.status !== null
          ? Number(body.status)
          : 1,
      sortBy:
        body.sortBy !== undefined && body.sortBy !== null ? Number(body.sortBy) : 0,
      description: body.description ? String(body.description) : null,
    },
  });

  return success(created);
});
