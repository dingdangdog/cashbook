import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/fixedFlow/update:
 *   post:
 *     summary: 更新固定流水
 *     tags: ["Fixed Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 固定流水ID
 *             month: string 月份
 *             money: number 金额
 *             name: string 名称
 *             description: string 描述
 *             flowType: string 流水类型
 *             industryType: string 行业类型
 *             payType: string 支付方式
 *             attribution: string 归属
 *     responses:
 *       200:
 *         description: 固定流水更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: FixedFlow 更新后的固定流水信息
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"请先选择账本" | "Not Find ID"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const {
    bookId,
    id,
    month,
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

  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.fixedFlow.update({
    where: { id, bookId },
    data: {
      month,
      money: Number(money || 0),
      name,
      description,
      flowType,
      industryType,
      payType,
      attribution,
    },
  });
  return success(updated);
});
