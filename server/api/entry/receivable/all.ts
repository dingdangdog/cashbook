import prisma from "~/lib/prisma";

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
 *             bookId: string 账本ID
 *             status: number 状态过滤（可选）
 *     responses:
 *       200:
 *         description: 待收款列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[Receivable待收款信息数组]
 *       400:
 *         description: 获取失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, status } = body;

  if (!bookId) {
    return error("请先选择账本");
  }

  const where: any = { bookId };

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
