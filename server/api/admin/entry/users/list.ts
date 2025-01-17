import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
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

  const users = await prisma.user.findMany({
    where, // 使用条件查询
  });

  return success(users);
});
