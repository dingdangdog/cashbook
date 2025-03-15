import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const {
    bookId,
    startMonth,
    endMonth,
    money,
    name,
    description,
    flowType,
    industryType,
    payType,
    attribution,
  } = body;

  if (!bookId) {
    return error("请先选择账本");
  }
  const userId = await getUserId(event);

  const start = new Date(startMonth);
  const end = new Date(endMonth);
  const createdRecords = [];

  // 遍历每个月份并新增固定支出记录
  for (let month = start; month <= end; month.setMonth(month.getMonth() + 1)) {
    const monthString = month.toISOString().slice(0, 7); // 格式化为 YYYY-MM

    const created = await prisma.fixedFlow.create({
      data: {
        bookId,
        userId,
        month: monthString,
        money: Number(money || 0),
        name,
        description,
        flowType,
        industryType,
        payType,
        attribution,
      },
    });

    createdRecords.push(created);
  }

  return success(createdRecords);
});
