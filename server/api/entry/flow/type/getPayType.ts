import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/type/getPayType:
 *   post:
 *     summary: 获取支付类型列表
 *     tags: ["Flow Type"]
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
 *               flowType:
 *                 type: string
 *                 description: 流水类型（可选）
 *     responses:
 *       200:
 *         description: 支付类型列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [
 *                   {
 *                     payType: 支付类型名称
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
  const { bookId, flowType } = await readBody(event); // 获取查询参数

  if (!bookId) {
    return error("请先选择账本");
  }
  const where: any = {
    bookId,
  }; // 条件查询

  if (flowType) {
    where.flowType = {
      equals: flowType,
    };
  }

  const flows = await prisma.flow.findMany({
    distinct: ["payType"],
    select: {
      payType: true,
    },
    orderBy: [
      {
        flowType: "asc",
      },
      {
        payType: "asc",
      },
    ],
    where, // 使用条件查询
  });

  return success(flows);
});
