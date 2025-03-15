import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, month } = body;
  if (!bookId) {
    return error("请先选择账本");
  }

  const where: any = {
    bookId,
  }; // 条件查询

  if (month) {
    where.month = {
      equals: month,
    };
  }

  const usedAmount = await prisma.flow.groupBy({
    where: { bookId: bookId, flowType: "支出", day: { startsWith: month } },
    by: ["flowType"],
    _sum: {
      money: true,
    },
  });

  // 更新预算表的used字段
  const updated = await prisma.budget.update({
    where: {
      bookId,
      month,
    },
    data: {
      used: usedAmount[0]._sum.money || 0,
    },
  });

  return success(updated);
});
