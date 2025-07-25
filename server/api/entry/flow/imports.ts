import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/imports:
 *   post:
 *     summary: 批量导入流水记录
 *     tags: ["Flow"]
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
 *               - flows
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               mode:
 *                 type: string
 *                 enum: ["add", "overwrite"]
 *                 description: 导入模式（add-追加，overwrite-覆盖）
 *               flows:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: 流水名称
 *                     day:
 *                       type: string
 *                       description: 日期
 *                     description:
 *                       type: string
 *                       description: 描述
 *                     flowType:
 *                       type: string
 *                       description: 流水类型
 *                     invoice:
 *                       type: string
 *                       description: 发票信息
 *                     money:
 *                       type: number
 *                       description: 金额
 *                     payType:
 *                       type: string
 *                       description: 支付方式
 *                     industryType:
 *                       type: string
 *                       description: 行业类型
 *                     attribution:
 *                       type: string
 *                       description: 归属
 *                 description: 流水记录数组
 *     responses:
 *       200:
 *         description: 导入成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: number 导入的记录数量
 *               }
 *       400:
 *         description: 导入失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  if (!body.bookId) {
    return error("请先选择账本");
  }

  // add/overwrite
  const mode = String(body.mode);
  const flows: any[] = body.flows;
  const userId = await getUserId(event);

  if (mode == "overwrite") {
    const del = await prisma.flow.deleteMany({
      where: {
        bookId: body.bookId,
      },
    });
  }
  const datas: any[] = [];
  flows.forEach((flow) => {
    datas.push({
      userId,
      bookId: body.bookId,
      name: flow.name,
      day: flow.day,
      description: flow.description,
      flowType: flow.flowType,
      invoice: flow.invoice ? String(flow.invoice) : null,
      money: Number(flow.money),
      payType: flow.payType,
      industryType: flow.type ? flow.type : flow.industryType || "",
      attribution: flow.attribution,
    });
  });
  // 在数据库中添加新数据
  const created = await prisma.flow.createMany({
    data: datas,
  });
  return success(created);
});
