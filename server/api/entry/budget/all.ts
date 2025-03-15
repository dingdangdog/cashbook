import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId } = body;
  if (!bookId) {
    return error("请先选择账本");
  }
  const datas = await prisma.budget.findMany({ where: { bookId } });
  return success(datas);
});
