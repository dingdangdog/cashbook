import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/fixedFlow/add:
 *   post:
 *     summary: 添加固定流水
 *     tags: ["Fixed Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             startMonth: string 开始月份（YYYY-MM格式）
 *             endMonth: string 结束月份（YYYY-MM格式）
 *             money: number 金额
 *             name: string 固定流水名称
 *             description: string 描述
 *             flowType: string 流水类型
 *             industryType: string 行业类型
 *             payType: string 支付方式
 *             attribution: string 归属
 *     responses:
 *       200:
 *         description: 固定流水添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[FixedFlow创建的固定流水记录数组]
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
  const body = await readBody(event);
  const {
    startMonth,
    endMonth,
    money,
    name,
    description,
    flowType,
    industryType,
    payType,
    attribution,
  } = body;

  const userId = await getUserId(event);

  const start = new Date(startMonth);
  const end = new Date(endMonth);
  const createdRecords = [];

  for (let month = start; month <= end; month.setMonth(month.getMonth() + 1)) {
    const monthString = month.toISOString().slice(0, 7);

    const created = await prisma.fixedFlow.create({
      data: {
        userId,
        month: monthString,
        money: Number(money || 0),
        name,
        description,
        flowType,
        industryType,
        payType,
        attribution,
      },
    });

    createdRecords.push(created);
  }

  return success(createdRecords);
});
