import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/book/list:
 *   post:
 *     summary: 获取账本列表
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
 *     responses:
 *       200:
 *         description: 账本列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[Book账本列表数组]
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数
  const userId = await getUserId(event);

  const where: any = {
    userId,
  }; // 条件查询

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(body.id),
    };
  }

  // 如果 `email` 存在，则根据 `email` 查询
  if (body.bookName) {
    where.bookName = {
      contains: String(body.bookName),
    };
  }

  const books = await prisma.book.findMany({
    where, // 使用条件查询
  });

  return success(books);
});
