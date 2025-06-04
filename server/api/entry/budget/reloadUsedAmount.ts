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
  // 如果没有找到匹配的流水数据，则将used设置为0
  const totalUsed = usedAmount.length > 0 ? usedAmount[0]._sum.money || 0 : 0;

  const updated = await prisma.budget.updateMany({
    where: {
      bookId,
      month,
    },
    data: {
      used: totalUsed,
    },
  });

  return success(updated);
});
