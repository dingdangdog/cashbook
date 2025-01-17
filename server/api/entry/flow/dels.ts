import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { ids, bookId } = await readBody(event); // 从请求体获取 ID
  const userId = await getUserId(event);

  if (!ids || !bookId) {
    return error("Not Find ID");
  }
  // 删除数据
  // const deleted = await prisma.flow.delete({
  //   where: { id, userId },
  // });

  return success("deleted");
});
