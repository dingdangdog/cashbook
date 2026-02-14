import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/toreceivable:
 *   post:
 *     summary: 将支出流水转换为待收款（借出记录）
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 流水ID
 *             expectDay: string 预期收款日期（可选）
 *     responses:
 *       200:
 *         description: 转换成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: {
 *                   flow: Flow 更新后的流水记录,
 *                   receivable: Receivable 创建的待收款记录
 *                 }
 *       400:
 *         description: 转换失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;
  const { id, expectDay } = body;

  if (!id) {
    return error("流水ID不能为空");
  }

  const userId = await getUserId(event);

  // 查询流水记录
  const flow = await prisma.flow.findFirst({
    where: {
      id: Number(id),
      bookId,
      flowType: "支出", // 只能转换支出流水
    },
  });

  if (!flow) {
    return error("流水记录不存在或不是支出类型");
  }

  // 开始事务处理
  const result = await prisma.$transaction(async (tx) => {
    // 创建待收款记录
    const receivable = await tx.receivable.create({
      data: {
        bookId,
        userId,
        name: flow.name || "借出款项",
        description: flow.description || `来自流水: ${flow.name}`,
        occurDay: flow.day,
        expectDay: expectDay ? new Date(expectDay) : null,
        money: flow.money || 0,
        occurId: flow.id,
        status: 0, // 未收款
      },
    });

    // 更新流水备注，标记已转为待收款
    const updatedFlow = await tx.flow.update({
      where: { id: Number(id) },
      data: {
        description: (flow.description || "") + " [已转为待收款]",
      },
    });

    return {
      flow: updatedFlow,
      receivable,
    };
  });

  return success(result);
});
