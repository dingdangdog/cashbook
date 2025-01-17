import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { bookId } = await readBody(event); // 获取查询参数
  const userId = await getUserId(event);

  if (!bookId) {
    return;
  }
  const where: any = {
    userId,
    bookId: String(bookId),
  }; // 条件查询

  const relations = await prisma.typeRelation.findMany({
    where, // 使用条件查询
    orderBy: [
      {
        target: "asc",
      },
    ],
  });

  // const datas: Record<string, string> = {};
  // relations.forEach((l) => {
  //   datas[l.source] = l.target;
  // });

  return success(relations);
});
