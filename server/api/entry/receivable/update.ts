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
 *             bookId: string 账本ID
 *             id: number 待收款ID
 *             name: string 待收款名称（可选）
 *             description: string 描述（可选）
 *             occurDay: string 发生日期（可选）
 *             expectDay: string 预期收款日期（可选）
 *             actualDay: string 实际收款日期（可选）
 *             money: number 金额（可选）
 *             status: number 状态（可选）
 *             actualId: number 关联的收款流水ID（可选）
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
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;
  const {
    id,
    name,
    description,
    occurDay,
    expectDay,
    actualDay,
    money,
    status,
    actualId,
  } = body;

  if (!id) {
    return error("Not Find ID");
  }

  // 构建更新数据对象，只更新提供的字段
  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description || null;
  if (occurDay !== undefined) updateData.occurDay = new Date(occurDay);
  if (expectDay !== undefined) updateData.expectDay = expectDay ? new Date(expectDay) : null;
  if (actualDay !== undefined) updateData.actualDay = actualDay ? new Date(actualDay) : null;
  if (money !== undefined) updateData.money = Number(money);
  if (status !== undefined) updateData.status = Number(status);
  if (actualId !== undefined)
    updateData.actualId = actualId ? Number(actualId) : null;

  const updated = await prisma.receivable.update({
    where: { id: Number(id), bookId },
    data: updateData,
  });

  return success(updated);
});
