import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, month, budget } = body;

  if (!bookId) {
    return error("请先选择账本");
  }
  const userId = await getUserId(event);

  // 在数据库中添加新数据
  const created = await prisma.budget.create({
    data: {
      bookId,
      userId,
      month,
      budget: Number(budget || 0),
    },
  });

  return success(created);
});
