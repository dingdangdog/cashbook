import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const {
    bookId,
    id,
    month,
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

  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.fixedFlow.update({
    where: { id, bookId },
    data: {
      month,
      money: Number(money || 0),
      name,
      description,
      flowType,
      industryType,
      payType,
      attribution,
    },
  });
  return success(updated);
});
