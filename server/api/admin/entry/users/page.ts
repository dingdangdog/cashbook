import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数
  const { name, username, email, id } = await readBody(event); // 获取查询参数

  const where: any = {}; // 条件查询

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(id),
    };
  }

  // 如果 `email` 存在，则根据 `email` 查询
  if (name) {
    where.name = {
      contains: name,
    };
  }
  if (username) {
    where.username = {
      contains: username,
    };
  }
  if (email) {
    where.email = {
      contains: email,
    };
  }

  // 分页条件
  const pageNum = Number(body.pageNum ? body.pageNum : 1);
  const pageSize = Number(body.pageSize ? body.pageSize : 15);
  const skip = (pageNum - 1) * pageSize; // 计算跳过的条目数

  // 排序条件
  const orderBy: any = {
    createDate: "desc",
  };

  // 【条件、排序、分页】 组合查询
  const users = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  // 计算总页数
  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / pageSize);

  return success({ total: totalUsers, data: users, pages: totalPages });
});
