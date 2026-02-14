import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/budget/reloadUsedAmount:
 *   post:
 *     summary: 重新加载预算已使用金额
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
 *     responses:
 *       200:
 *         description: 已使用金额重新加载成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: number 更新的记录数量
 *       400:
 *         description: 重新加载失败
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
  const month = body.month;

  const where: any = {
    bookId,
  }; // 条件查询

  if (month) {
    where.month = {
      equals: month,
    };
  }

  const usedAmount = await prisma.flow.groupBy({
    where: { bookId: bookId, flowType: "支出", day: { startsWith: month } },
    by: ["flowType"],
    _sum: {
      money: true,
    },
  });

  // 更新预算表的used字段
  // 如果没有找到匹配的流水数据，则将used设置为0
  const totalUsed = usedAmount.length > 0 ? usedAmount[0]._sum.money || 0 : 0;

  const updated = await prisma.budget.updateMany({
    where: {
      bookId,
      month,
    },
    data: {
      used: totalUsed,
    },
  });

  return success(updated);
});
