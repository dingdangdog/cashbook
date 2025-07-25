import prisma from "~/lib/prisma";

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
 *             type: object
 *             required:
 *               - bookId
 *               - startMonth
 *               - endMonth
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               startMonth:
 *                 type: string
 *                 description: 开始月份（YYYY-MM格式）
 *               endMonth:
 *                 type: string
 *                 description: 结束月份（YYYY-MM格式）
 *               money:
 *                 type: number
 *                 description: 金额
 *               name:
 *                 type: string
 *                 description: 固定流水名称
 *               description:
 *                 type: string
 *                 description: 描述
 *               flowType:
 *                 type: string
 *                 description: 流水类型
 *               industryType:
 *                 type: string
 *                 description: 行业类型
 *               payType:
 *                 type: string
 *                 description: 支付方式
 *               attribution:
 *                 type: string
 *                 description: 归属
 *     responses:
 *       200:
 *         description: 固定流水添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[FixedFlow创建的固定流水记录数组]
 *               }
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
  const {
    bookId,
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

  if (!bookId) {
    return error("请先选择账本");
  }
  const userId = await getUserId(event);

  const start = new Date(startMonth);
  const end = new Date(endMonth);
  const createdRecords = [];

  // 遍历每个月份并新增固定支出记录
  for (let month = start; month <= end; month.setMonth(month.getMonth() + 1)) {
    const monthString = month.toISOString().slice(0, 7); // 格式化为 YYYY-MM

    const created = await prisma.fixedFlow.create({
      data: {
        bookId,
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
