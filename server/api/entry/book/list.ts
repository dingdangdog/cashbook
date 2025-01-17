import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数
  const userId = await getUserId(event);

  const where: any = {
    userId,
  }; // 条件查询

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(body.id),
    };
  }

  // 如果 `email` 存在，则根据 `email` 查询
  if (body.bookName) {
    where.bookName = {
      contains: String(body.bookName),
    };
  }

  const books = await prisma.book.findMany({
    where, // 使用条件查询
  });

  return success(books);
});
