import prisma from "~~/server/lib/prisma";

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
 *             flowType: string 流水类型（可选）
 *     responses:
 *       200:
 *         description: 支付类型列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] # {payType: 支付类型名称}
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const flowType = body.flowType;
  const where: any = {};

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
