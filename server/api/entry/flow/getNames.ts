import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/getNames:
 *   post:
 *     summary: 获取流水名称列表
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: {}
 *     responses:
 *       200:
 *         description: 流水名称列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[string流水名称数组]
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const flows = await prisma.flow.findMany({
    where: { userId },
    distinct: ["name"],
    select: {
      name: true,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
  });

  // 提取 name 属性并返回集合
  // const names = flows.map((flow) => flow.name);

  const names = flows
    .map((flow) => flow.name)
    .filter((attribution) => attribution && attribution.trim() !== "");

  return success(names);
});
