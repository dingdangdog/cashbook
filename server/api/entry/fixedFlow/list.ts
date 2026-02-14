import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/fixedFlow/list:
 *   post:
 *     summary: 获取固定流水列表
 *     tags: ["Fixed Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 固定流水ID（可选）
 *             month: string 月份（可选）
 *     responses:
 *       200:
 *         description: 固定流水列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[FixedFlow固定流水列表数组]
 *       400:
 *         description: 获取失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;

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
