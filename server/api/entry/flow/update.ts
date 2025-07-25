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
 *             bookId: string 账本ID
 *             id: number 流水ID
 *             day: string 日期
 *             flowType: string 流水类型（收入、支出）
 *             industryType: string 行业分类
 *             payType: string 支付方式
 *             name: string 流水名称
 *             money: number 金额
 *             description: string 描述
 *             attribution: string 归属
 *     responses:
 *       200:
 *         description: 流水记录更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Flow 更新后的流水记录
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
