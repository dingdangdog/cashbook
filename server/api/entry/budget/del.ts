import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/budget/del:
 *   post:
 *     summary: 删除预算
 *     tags: ["Budget"]
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
 *               - id
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               id:
 *                 type: number
 *                 description: 预算ID
 *     responses:
 *       200:
 *         description: 预算删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 删除的预算信息
 *               }
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"请先选择账本" | "Not Find ID"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, id } = body;
  if (!bookId) {
    return error("请先选择账本");
  }

  if (!id) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.budget.delete({
    where: { id, bookId },
  });

  return success(deleted);
});
