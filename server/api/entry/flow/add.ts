import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  if (!body.bookId) {
    return;
  }
  const userId = await getUserId(event);
  const flow = {
    bookId: String(body.bookId),
    userId: userId,
    day: String(body.day || ""),
    flowType: String(body.flowType || ""), // 流水类型：收入、支出
    industryType: String(body.industryType || ""), // 行业分类 原 type（收入类型、支出类型）
    payType: String(body.payType || ""), // 支付方式
    money: Number(body.money || ""),
    name: String(body.name || ""),
    description: String(body.description || ""),
    invoice: String(body.invoice || ""),
  };

  // 在数据库中添加新数据
  const created = await prisma.flow.create({
    data: flow,
  });
  return success(created);
});
