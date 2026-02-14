import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/budget/all:
 *   post:
 *     summary: 获取账本所有预算
 *     tags: ["Budget"]
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
 *         description: 预算列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[Budget预算信息数组]
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
  const body = await readBody(event);
  const datas = await prisma.budget.findMany({
    where: { userId: await getUserId(event) },
  });
  return success(datas);
});
