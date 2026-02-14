import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/budget/update:
 *   post:
 *     summary: 更新预算
 *     tags: ["Budget"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 预算ID
 *             month: string 月份
 *             budget: number 预算金额
 *     responses:
 *       200:
 *         description: 预算更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Budget 更新后的预算信息
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"请先选择账本" | "Not Find ID" | "Not Find Month"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, budget, month } = body;

  if (!id) {
    return error("Not Find ID");
  }
  if (!month) {
    return error("Not Find Month");
  }
  const userId = await getUserId(event);
  const row = await prisma.budget.findFirst({
    where: { id: Number(id), userId },
  });
  if (!row) {
    return error("Not Find ID");
  }
  const updated = await prisma.budget.update({
    where: { id: Number(id) },
    data: {
      budget: Number(budget || 0),
    },
  });
  return success(updated);
});
