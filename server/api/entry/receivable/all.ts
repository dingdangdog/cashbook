import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/receivable/all:
 *   post:
 *     summary: 获取账本所有待收款
 *     tags: ["Receivable"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             status: number 状态过滤（可选）
 *     responses:
 *       200:
 *         description: 待收款列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[Receivable待收款信息数组]
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const status = body.status;

  const where: any = { userId };

  // 如果指定了状态，则按状态过滤
  if (status !== undefined && status !== null) {
    where.status = Number(status);
  }

  const datas = await prisma.receivable.findMany({
    where,
    orderBy: {
      occurDay: "desc", // 按发生日期降序排列
    },
  });

  return success(datas);
});
