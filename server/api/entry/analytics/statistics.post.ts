import prisma from "~~/server/lib/prisma";

/**
 * 按起始/结束日期统计账本：总收入、总支出、净收入
 * 不传 startDate/endDate 则统计全部时间
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event).catch(() => ({}));
  const startDate = body?.startDate as string | undefined;
  const endDate = body?.endDate as string | undefined;

  const where: any = { userId };

  if (startDate || endDate) {
    where.day = {};
    if (startDate) {
      where.day.gte = new Date(startDate + "T00:00:00.000Z");
    }
    if (endDate) {
      where.day.lte = new Date(endDate + "T23:59:59.999Z");
    }
  }

  const groups = await prisma.flow.groupBy({
    by: ["flowType"],
    _sum: { money: true },
    where,
  }) as { flowType: string | null; _sum: { money: number | null } }[];

  let totalIncome = 0;
  let totalExpense = 0;
  for (const g of groups) {
    const sum = g._sum.money ?? 0;
    if (g.flowType === "收入") totalIncome += sum;
    else if (g.flowType === "支出") totalExpense += sum;
  }
  const netIncome = totalIncome - totalExpense;

  return success({
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100,
  });
});
