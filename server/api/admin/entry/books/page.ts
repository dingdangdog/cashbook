import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数

  const where: any = {}; // 条件查询

  // 普通查询条件
  if (body.bookId) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.bookId = {
      equals: body.bookId,
    };
  }
  if (body.bookName) {
    where.bookName = {
      equals: body.bookName,
    };
  }
  if (body.userId) {
    where.userId = {
      equals: body.userId,
    };
  }

  // 分页条件
  const pageNum = Number(body.pageNum ? body.pageNum : 1);
  const pageSize = Number(body.pageSize ? body.pageSize : 15);
  const skip = (pageNum - 1) * pageSize; // 计算跳过的条目数

  // 排序条件
  const orderBy: any = [
    {
      createDate: "desc",
    },
  ];
  if (pageSize == -1) {
    // 查询全部
    const datas = await prisma.book.findMany({ where, orderBy });
    return success({ total: datas.length, data: datas, pages: 1 });
  }
  // 【条件、排序、分页】 组合查询
  const users = await prisma.book.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  // 计算总页数
  const totals = await prisma.book.count({ where });
  const totalPages = Math.ceil(totals / pageSize);

  return success({ total: totals, data: users, pages: totalPages });
});
