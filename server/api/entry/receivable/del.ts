import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/receivable/del:
 *   post:
 *     summary: 删除待收款
 *     tags: ["Receivable"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 待收款ID
 *     responses:
 *       200:
 *         description: 待收款删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Receivable 删除的待收款信息
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
  const deleted = await prisma.receivable.delete({
    where: { id: Number(id), bookId },
  });

  return success(deleted);
});
