import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/budget/list:
 *   post:
 *     summary: 获取预算列表
 *     tags: ["Budget"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 预算ID（可选）
 *             month: string 月份（可选）
 *     responses:
 *       200:
 *         description: 预算列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[Budget预算信息数组]
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const month = body.month;

  const where: any = { userId };

  if (body.id) {
    where.id = { equals: Number(body.id) };
  }
  if (month) {
    where.month = { equals: month };
  }

  const datas = await prisma.budget.findMany({
    where,
  });

  return success(datas);
});
