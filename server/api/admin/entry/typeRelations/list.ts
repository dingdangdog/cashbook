import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/typeRelations/list:
 *   post:
 *     summary: 管理员获取类型关系列表
 *     tags: ["Admin Type Relations"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             id: number 关系ID（可选）
 *             bookId: string 账本ID（可选）
 *             userId: number 用户ID（可选）
 *     responses:
 *       200:
 *         description: 类型关系列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[TypeRelation类型关系列表数组]
 */
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
      equals: body.bookId,
    };
  }
  if (body.userId) {
    where.userId = {
      equals: Number(body.userId),
    };
  }

  const typeRelations = await prisma.typeRelation.findMany({
    where, // 使用条件查询
  });

  // 获取相关的账本信息
  const bookIds = [...new Set(typeRelations.map(item => item.bookId))];
  const books = await prisma.book.findMany({
    where: { bookId: { in: bookIds } },
    select: { id: true, bookId: true, bookName: true }
  });
  
  // 创建账本映射
  const bookMap = new Map(books.map(book => [book.bookId, book]));
  
  // 添加账本信息到结果中
  const typeRelationsWithBookInfo = typeRelations.map(item => {
    const bookInfo = bookMap.get(item.bookId);
    return {
      ...item,
      bookName: bookInfo?.bookName || '未知账本',
      bookDbId: bookInfo?.id || null, // 数据库内部ID
    };
  });

  return success(typeRelationsWithBookInfo);
});
