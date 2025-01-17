import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.id || !body.bookId) {
    return error("Not Find ID");
  }
  const flow = {
    day: String(body.day || ""),
    flowType: String(body.flowType || ""), // 流水类型：收入、支出
    industryType: String(body.industryType || ""), // 行业分类 原 type（收入类型、支出类型）
    payType: String(body.payType || ""), // 支付方式
    money: Number(body.money || ""),
    name: String(body.name || ""),
    description: String(body.description || ""),
    invoice: String(body.invoice || ""),
  };
  const updated = await prisma.flow.update({
    where: { id: Number(body.id), bookId: body.bookId },
    data: flow,
  });
  return success(updated);
});
