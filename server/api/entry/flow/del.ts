import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id, bookId } = await readBody(event); // 从请求体获取 ID

  if (!id || !bookId) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.flow.delete({
    where: { id, bookId },
  });

  return success(deleted);
});
