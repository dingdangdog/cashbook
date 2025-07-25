import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/type/getAll:
 *   post:
 *     summary: 获取所有流水类型
 *     tags: ["Flow Type"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             flowType: string 流水类型（可选）
 *     responses:
 *       200:
 *         description: 类型列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] # { type: 类型分类（"支出类型/收入类型" | "支付方式/收款方式"）, flowType: 流水类型, value: 类型值 }
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
  const { bookId, flowType } = await readBody(event); // 获取查询参数

  if (!bookId) {
    return error("请先选择账本");
  }
  const where: any = {
    bookId,
  }; // 条件查询

  if (flowType) {
    where.flowType = {
      equals: flowType,
    };
  }

  const industryTypes = await prisma.flow.findMany({
    distinct: ["industryType"],
    select: {
      industryType: true,
      flowType: true,
    },
    orderBy: [
      {
        flowType: "asc",
      },
      {
        industryType: "asc",
      },
    ],
    where, // 使用条件查询
  });
  const payTypes = await prisma.flow.findMany({
    distinct: ["payType"],
    select: {
      payType: true,
      flowType: true,
    },
    orderBy: [
      {
        flowType: "asc",
      },
      {
        payType: "asc",
      },
    ],
    where, // 使用条件查询
  });

  // console.log(industryTypes);
  // console.log(payTypes);
  const types: any = [];
  industryTypes.forEach((t) => {
    types.push({
      type: "支出类型/收入类型",
      flowType: t.flowType,
      value: t.industryType,
    });
  });
  payTypes.forEach((t) => {
    types.push({
      type: "支付方式/收款方式",
      flowType: t.flowType,
      value: t.payType,
    });
  });

  return success(types);
});
