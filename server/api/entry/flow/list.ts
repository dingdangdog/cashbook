import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数

  if (!body.bookId) {
    return error("Not Find BookId");
  }
  const where: any = {
    bookId: body.bookId,
  }; // 条件查询

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(body.id),
    };
  }
  if (body.name) {
    where.name = {
      contains: body.name,
    };
  }
  if (body.flowType) {
    where.flowType = {
      equals: body.flowType,
    };
  }
  if (body.industryType) {
    where.industryType = {
      equals: body.industryType,
    };
  }
  if (body.payType) {
    where.payType = {
      equals: body.payType,
    };
  }
  if (body.startDay && body.endDay) {
    where.day = {
      gte: body.startDay,
      lte: body.endDay,
    };
  } else if (body.startDay) {
    where.day = {
      gte: body.startDay,
    };
  } else if (body.endDay) {
    where.day = {
      lte: body.endDay,
    };
  }

  const flows = await prisma.flow.findMany({
    where, // 使用条件查询
  });

  return success(flows);
});
