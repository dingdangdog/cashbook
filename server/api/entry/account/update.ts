import prisma from "~~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const id = Number(body.id);
  if (!id) {
    return error("Not Find ID");
  }

  const row = await prisma.fundAccount.findFirst({
    where: { id, userId },
  });
  if (!row) {
    return error("Not Find ID");
  }

  const data: any = {};
  if (body.name !== undefined) data.name = String(body.name || "").trim();
  if (body.accountType !== undefined)
    data.accountType = String(body.accountType || "").trim();
  if (body.institution !== undefined)
    data.institution = body.institution ? String(body.institution) : null;
  if (body.accountNo !== undefined)
    data.accountNo = body.accountNo ? String(body.accountNo) : null;
  if (body.currency !== undefined)
    data.currency = body.currency ? String(body.currency) : "CNY";
  if (body.initialBalance !== undefined)
    data.initialBalance = Number(body.initialBalance);
  if (body.currentBalance !== undefined)
    data.currentBalance = Number(body.currentBalance);
  if (body.totalIncome !== undefined) data.totalIncome = Number(body.totalIncome);
  if (body.totalExpense !== undefined)
    data.totalExpense = Number(body.totalExpense);
  if (body.totalLiability !== undefined)
    data.totalLiability = Number(body.totalLiability);
  if (body.totalProfit !== undefined) data.totalProfit = Number(body.totalProfit);
  if (body.status !== undefined) data.status = Number(body.status);
  if (body.sortBy !== undefined) data.sortBy = Number(body.sortBy);
  if (body.description !== undefined)
    data.description = body.description ? String(body.description) : null;
  if (body.lastFlowAt !== undefined)
    data.lastFlowAt = body.lastFlowAt ? new Date(body.lastFlowAt) : null;

  if (data.name !== undefined && !data.name) {
    return error("账户名称不能为空");
  }
  if (data.accountType !== undefined && !data.accountType) {
    return error("账户类型不能为空");
  }

  const updated = await prisma.fundAccount.update({
    where: { id },
    data,
  });
  return success(updated);
});
