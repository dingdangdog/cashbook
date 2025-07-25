import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/update:
 *   post:
 *     summary: 更新流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - bookId
 *             properties:
 *               id:
 *                 type: number
 *                 description: 流水ID
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               day:
 *                 type: string
 *                 description: 日期
 *               flowType:
 *                 type: string
 *                 description: 流水类型（收入、支出）
 *               industryType:
 *                 type: string
 *                 description: 行业分类
 *               payType:
 *                 type: string
 *                 description: 支付方式
 *               name:
 *                 type: string
 *                 description: 流水名称
 *               money:
 *                 type: number
 *                 description: 金额
 *               description:
 *                 type: string
 *                 description: 描述
 *               attribution:
 *                 type: string
 *                 description: 归属
 *     responses:
 *       200:
 *         description: 流水记录更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: Flow 更新后的流水记录
 *               }
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.id || !body.bookId) {
    return error("Not Find ID");
  }
  const flow = {
    day: String(body.day || ""),
    flowType: String(body.flowType || ""), // 流水类型：收入、支出
    industryType: String(body.industryType || ""), // 行业分类 原 type（收入类型、支出类型）
    payType: String(body.payType || ""), // 支付方式
    money: Number(body.money || ""),
    name: String(body.name || ""),
    description: String(body.description || ""),
    attribution: String(body.attribution || ""),
  };
  const updated = await prisma.flow.update({
    where: { id: Number(body.id), bookId: body.bookId },
    data: flow,
  });
  return success(updated);
});
