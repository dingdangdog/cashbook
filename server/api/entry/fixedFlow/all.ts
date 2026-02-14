import prisma from "~~/server/lib/prisma";

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
 *           schema: {}
 *     responses:
 *       200:
 *         description: 固定流水列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[FixedFlow 固定流水信息数组]
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const datas = await prisma.fixedFlow.findMany({ where: { userId } });
  return success(datas);
});
