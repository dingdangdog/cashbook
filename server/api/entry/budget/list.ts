import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, month } = body;
  if (!bookId) {
    return error("请先选择账本");
  }

  const where: any = {
    bookId,
  }; // 条件查询

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(body.id),
    };
  }
  if (month) {
    where.month = {
      equals: month,
    };
  }

  const datas = await prisma.budget.findMany({
    where, // 使用条件查询
  });

  // 如果 datas 为空，则查询 book表中设置的预算，并添加一条记录到预算表
  if (datas.length === 0) {
    const book = await prisma.book.findFirst({
      where: {
        bookId: bookId,
      },
    });
    console.log(book);
    if (book) {
      const budget = await prisma.budget.create({
        data: {
          bookId,
          month: body.month,
          budget: book.budget,
          userId: book.userId,
        },
      });
      datas.push(budget);
    }
  }

  return success(datas);
});
