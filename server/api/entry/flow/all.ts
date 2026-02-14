import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/all:
 *   get:
 *     summary: 获取账本所有流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: 流水记录列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[Flow流水记录数组]
 *               }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const flows = await prisma.flow.findMany({
    where: { userId },
  });
  return success(flows);
});
