import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/budget/add:
 *   post:
 *     summary: 添加预算
 *     tags: ["Budget"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             month: string 月份
 *             budget: number 预算金额（默认为0）
 *     responses:
 *       200:
 *         description: 预算添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Budget 实体
 *       400:
 *         description: 添加失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, month, budget } = body;

  if (!bookId) {
    return error("请先选择账本");
  }
  const userId = await getUserId(event);

  // 在数据库中添加新数据
  const created = await prisma.budget.create({
    data: {
      bookId,
      userId,
      month,
      budget: Number(budget || 0),
    },
  });

  return success(created);
});
