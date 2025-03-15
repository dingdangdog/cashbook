import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId } = body;
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

  if (body.month) {
    where.month = {
      equals: body.month,
    };
  }

  const datas = await prisma.fixedFlow.findMany({
    where, // 使用条件查询
  });

  return success(datas);
});
