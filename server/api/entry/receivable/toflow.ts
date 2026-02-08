import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/receivable/toflow:
 *   post:
 *     summary: 将待收款转换为收入流水
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
 *             actualDay: string 实际收款日期
 *             payType: string 收款方式（可选）
 *             industryType: string 收入类型（可选）
 *             attribution: string 流水归属（可选）
 *     responses:
 *       200:
 *         description: 转换成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: {
 *                   receivable: Receivable 更新后的待收款,
 *                   flow: Flow 创建的流水记录
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
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { bookId, id, actualDay, payType, industryType, attribution } = body;

  if (!bookId) {
    return error("请先选择账本");
  }

  if (!id) {
    return error("待收款ID不能为空");
  }

  if (!actualDay) {
    return error("实际收款日期不能为空");
  }

  const userId = await getUserId(event);

  // 查询待收款记录
  const receivable = await prisma.receivable.findFirst({
    where: {
      id: Number(id),
      bookId,
      status: 0, // 只能转换未收款状态的记录
    },
  });

  if (!receivable) {
    return error("待收款记录不存在或已收款");
  }

  // 开始事务处理
  const result = await prisma.$transaction(async (tx) => {
    // 创建收入流水
    const actualDate = new Date(actualDay);
    const flow = await tx.flow.create({
      data: {
        bookId,
        userId,
        day: actualDate,
        flowType: "收入",
        name: receivable.name || "待收款收入",
        description: receivable.description || `来自待收款: ${receivable.name}`,
        money: receivable.money || 0,
        payType: payType || "现金",
        industryType: industryType || "其他收入",
        attribution: attribution || "",
        origin: "待收款转入",
      },
    });

    // 更新待收款状态
    const updatedReceivable = await tx.receivable.update({
      where: { id: Number(id) },
      data: {
        status: 1, // 已收款
        actualDay: actualDate,
        actualId: flow.id,
      },
    });

    return {
      receivable: updatedReceivable,
      flow,
    };
  });

  return success(result);
});
