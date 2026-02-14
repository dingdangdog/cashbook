import prisma from "~~/server/lib/prisma";

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
 *             id: number 预算ID
 *     responses:
 *       200:
 *         description: 预算删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Budget 删除的预算信息
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
  const body = await readBody(event);
  const id = body.id;

  if (!id) {
    return error("Not Find ID");
  }
  const deleted = await prisma.budget.delete({
    where: { id },
  });

  return success(deleted);
});
