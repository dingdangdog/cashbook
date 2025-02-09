import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { ids, bookId } = await readBody(event); // 从请求体获取 ID
  // const userId = await getUserId(event);

  if (!ids || !bookId) {
    return error("Not Find ID");
  }
  const deleted = await prisma.flow.deleteMany({
    where: {
      id: {
        in: ids,
      },
      bookId: String(bookId),
    },
  });
  return success(deleted);
});
