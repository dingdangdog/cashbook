import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/getAttributions:
 *   post:
 *     summary: 获取流水归属列表
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
 *         description: 流水归属列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[string归属名称数组]
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const flows = await prisma.flow.findMany({
    where: { userId },
    distinct: ["attribution"],
    select: {
      attribution: true,
    },
    orderBy: [
      {
        attribution: "asc",
      },
    ],
  });

  // 提取 attribution 属性并返回集合
  const names = flows
    .map((flow) => flow.attribution)
    .filter((attribution) => attribution && attribution.trim() !== "");

  return success(names);
});
