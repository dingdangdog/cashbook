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
 *             month: string 月份
 *     responses:
 *       200:
 *         description: 已使用金额重新加载成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: number 更新的记录数量
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const month = body.month;

  if (!month) {
    return error("请提供月份");
  }

  const monthStart = new Date(month + "-01");
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const usedAmount = await prisma.flow.groupBy({
    where: {
      userId,
      flowType: "支出",
      day: { gte: monthStart, lt: monthEnd },
    },
    by: ["flowType"],
    _sum: {
      money: true,
    },
  });

  const totalUsed = usedAmount.length > 0 ? usedAmount[0]._sum.money || 0 : 0;

  const updated = await prisma.budget.updateMany({
    where: {
      userId,
      month,
    },
    data: {
      used: totalUsed,
    },
  });

  return success(updated);
});
