import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, id } = body;
  if (!bookId) {
    return error("请先选择账本");
  }

  if (!id) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.fixedFlow.delete({
    where: { id, bookId },
  });

  return success(deleted);
});
