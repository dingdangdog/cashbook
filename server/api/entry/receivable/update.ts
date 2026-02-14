import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/receivable/update:
 *   post:
 *     summary: 更新待收款
 *     tags: ["Receivable"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 待收款ID
 *             name: string 待收款名称（可选）
 *             description: string 描述（可选）
 *             occurDay: string 发生日期（可选）
 *             money: number 金额（可选）
 *             status: number 状态（可选）
 *             occurFlowId: number 关联的借出流水ID（可选）
 *     responses:
 *       200:
 *         description: 待收款更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Receivable 更新后的待收款信息
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"请先选择账本" | "Not Find ID"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    id,
    name,
    description,
    occurDay,
    money,
    status,
    occurFlowId,
  } = body;

  if (!id) {
    return error("Not Find ID");
  }

  const userId = await getUserId(event);
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description || null;
  if (occurDay !== undefined) updateData.occurDay = new Date(occurDay);
  if (money !== undefined) updateData.money = Number(money);
  if (status !== undefined) updateData.status = Number(status);
  if (occurFlowId !== undefined) updateData.occurFlowId = occurFlowId ? Number(occurFlowId) : null;

  const row = await prisma.receivable.findFirst({
    where: { id: Number(id), userId },
  });
  if (!row) {
    return error("Not Find ID");
  }
  const updated = await prisma.receivable.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return success(updated);
});
