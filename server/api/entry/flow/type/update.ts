import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/type/update:
 *   post:
 *     summary: 更新流水类型
 *     tags: ["Flow Type"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             type: string 类型分类
 *             oldValue: string 原类型值
 *             value: string 新类型值
 *     responses:
 *       200:
 *         description: 类型更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d:
 *                   count: 更新的记录数量
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Not Find ID" | "Not Find value" | "Unknown Type"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.bookId) {
    return error("Not Find ID");
  }
  if (!body.value || !body.type || !body.oldValue) {
    return error("Not Find value");
  }

  const where: any = {
    bookId: body.bookId,
  };
  const data: any = {};
  if (body.type == "支出类型/收入类型") {
    where.industryType = String(body.oldValue);
    data.industryType = String(body.value);
  } else if (body.type == "支付方式/收款方式") {
    where.payType = String(body.oldValue);
    data.payType = String(body.value);
  } else {
    return error("Unknown Type");
  }

  const updated = await prisma.flow.updateMany({
    where,
    data,
  });
  return success(updated);
});
