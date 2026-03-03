import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/typeRelations/all:
 *   get:
 *     summary: 管理员获取所有类型关系
 *     tags: ["Admin Type Relations"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 类型关系列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [
 *                   {
 *                     id: 关系ID,
 *                     bookId: 账本ID,
 *                     userId: 用户ID,
 *                     source: 源类型,
 *                     target: 目标类型,
 *                     bookName: 账本名称,
 *                     bookDbId: 账本数据库ID
 *                   }
 *                 ]
 *               }
 */
export default defineEventHandler(async (event) => {
  const typeRelations = await prisma.typeRelation.findMany();
  
  // 获取所有相关的账本信息
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
