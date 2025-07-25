import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/books/list:
 *   post:
 *     summary: 管理员获取账本列表
 *     tags: ["Admin Books"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             id: number 账本ID（可选）
 *             bookName: string 账本名称（可选）
 *             userId: number 用户ID（可选）
 *     responses:
 *       200:
 *         description: 账本列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[Book账本数组]
 *               }
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
  
  const users = await prisma.book.findMany({
    where, // 使用条件查询
  });

  return success(users);
});
