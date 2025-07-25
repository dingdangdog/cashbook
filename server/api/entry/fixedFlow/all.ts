import prisma from "~/lib/prisma";

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
 *           schema:
 *             bookId: string 账本ID
 *     responses:
 *       200:
 *         description: 固定流水列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[FixedFlow 固定流水信息数组]
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
  const body = await readBody(event); // 获取请求体
  const { bookId } = body;
  if (!bookId) {
    return error("请先选择账本");
  }
  const datas = await prisma.fixedFlow.findMany({ where: { bookId } });
  return success(datas);
});
