import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, id, budget, month } = body;
  if (!bookId) {
    return error("请先选择账本");
  }

  if (!id) {
    return error("Not Find ID");
  }
  if (!month) {
    return error("Not Find Month");
  }
  const updated = await prisma.budget.update({
    where: { id, bookId, month },
    data: {
      budget: Number(budget || 0),
    },
  });
  return success(updated);
});
