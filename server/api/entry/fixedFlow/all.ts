import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/fixedFlow/all:
 *   post:
 *     summary: 获取账本所有固定流水
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
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *     responses:
 *       200:
 *         description: 固定流水列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [
 *                   {
 *                     id: 固定流水ID,
 *                     bookId: 账本ID,
 *                     userId: 用户ID,
 *                     month: 月份,
 *                     money: 金额,
 *                     name: 名称,
 *                     description: 描述,
 *                     flowType: 流水类型,
 *                     industryType: 行业类型,
 *                     payType: 支付方式,
 *                     attribution: 归属
 *                   }
 *                 ]
 *               }
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
  const { bookId } = body;
  if (!bookId) {
    return error("请先选择账本");
  }
  const datas = await prisma.fixedFlow.findMany({ where: { bookId } });
  return success(datas);
});
