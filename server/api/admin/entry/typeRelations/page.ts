import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数

  const where: any = {}; // 条件查询

  // 普通查询条件
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: body.id,
    };
  }
  if (body.bookId) {
    where.bookId = {
      equals: "0",
    };
  }
  if (body.userId) {
    where.userId = {
      // equals: Number(body.userId),
      equals: 0,
    };
  }
  if (body.source) {
    where.source = {
      contains: body.source,
    };
  }
  if (body.target) {
    where.target = {
      contains: body.target,
    };
  }

  // 分页条件
  const pageNum = Number(body.pageNum ? body.pageNum : 1);
  const pageSize = Number(body.pageSize ? body.pageSize : 15);
  const skip = (pageNum - 1) * pageSize; // 计算跳过的条目数

  // 排序条件
  const orderBy: any = [
    {
      bookId: "asc",
    },
    {
      target: "desc",
    },
  ];

  // 【条件、排序、分页】 组合查询
  const users = await prisma.typeRelation.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  // 计算总页数
  const totalUsers = await prisma.typeRelation.count({ where });
  const totalPages = Math.ceil(totalUsers / pageSize);

  return success({ total: totalUsers, data: users, pages: totalPages });
});
