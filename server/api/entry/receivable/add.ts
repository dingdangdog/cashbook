import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/receivable/add:
 *   post:
 *     summary: 添加待收款
 *     tags: ["Receivable"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             name: string 待收款名称
 *             description: string 描述（可选）
 *             occurDay: string 发生日期
 *             expectDay: string 预期收款日期（可选）
 *             money: number 金额
 *             occurId: number 关联的借出流水ID（可选）
 *     responses:
 *       200:
 *         description: 待收款添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Receivable 实体
 *       400:
 *         description: 添加失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本" | "待收款名称不能为空" | "发生日期不能为空" | "金额不能为空"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookId, name, description, occurDay, expectDay, money, occurId } =
    body;

  if (!bookId) {
    return error("请先选择账本");
  }

  if (!name) {
    return error("待收款名称不能为空");
  }

  if (!occurDay) {
    return error("发生日期不能为空");
  }

  if (!money || Number(money) <= 0) {
    return error("金额不能为空且必须大于0");
  }

  const userId = await getUserId(event);

  // 在数据库中添加新数据
  const created = await prisma.receivable.create({
    data: {
      bookId,
      userId,
      name,
      description: description || null,
      occurDay: new Date(occurDay),
      expectDay: expectDay ? new Date(expectDay) : null,
      money: Number(money),
      occurId: occurId ? Number(occurId) : null,
      status: 0, // 默认状态为未收款
    },
  });

  return success(created);
});
