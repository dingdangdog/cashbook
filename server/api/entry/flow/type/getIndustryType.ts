import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/type/getIndustryType:
 *   post:
 *     summary: 获取行业类型列表
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
 *         description: 行业类型列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] # {industryType: 行业类型名称}
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const flowType = body.flowType;
  const where: any = { userId };

  if (flowType) {
    where.flowType = {
      equals: flowType,
    };
  }

  const flows = await prisma.flow.findMany({
    distinct: ["industryType"],
    select: {
      industryType: true,
    },
    orderBy: [
      {
        flowType: "asc",
      },
      {
        industryType: "asc",
      },
    ],
    where, // 使用条件查询
  });

  return success(flows);
});
