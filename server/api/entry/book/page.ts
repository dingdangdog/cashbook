import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/book/page:
 *   post:
 *     summary: 分页获取账本列表
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             id: number 账本ID（可选）
 *             bookName: string 账本名称（可选，支持模糊查询）
 *             shareKey: string 分享密钥（可选）
 *             pageNum: number 页码（默认为1）
 *             pageSize: number 每页大小（默认为15，-1表示查询全部）
 *     responses:
 *       200:
 *         description: 分页数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: PagePack<Book> 账本分页数据
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数
  const userId = await getUserId(event);

  const where: any = {
    userId,
  }; // 条件查询

  // 普通查询条件
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: body.id,
    };
  }
  if (body.bookName) {
    where.bookName = {
      contains: body.bookName,
    };
  }
  if (body.shareKey) {
    where.shareKey = {
      equals: body.shareKey,
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
  const totalUsers = await prisma.book.count({ where });
  const totalPages = Math.ceil(totalUsers / pageSize);

  return success({ total: totalUsers, data: users, pages: totalPages });
});
