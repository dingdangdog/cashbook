import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/all:
 *   get:
 *     summary: 获取账本所有流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: query
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 账本ID
 *     responses:
 *       200:
 *         description: 流水记录列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[Flow流水记录数组]
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
  const query = getQuery(event);
  if (!query.bookId) {
    return error("请先选择账本");
  }
  const flows = await prisma.flow.findMany({
    where: { bookId: String(query.bookId) },
  });
  return success(flows);
});
