import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/updates:
 *   post:
 *     summary: 批量更新流水记录
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
 *               - ids
 *               - bookId
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: 流水ID数组
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               flowType:
 *                 type: string
 *                 description: 流水类型（可选）
 *               industryType:
 *                 type: string
 *                 description: 行业分类（可选）
 *               payType:
 *                 type: string
 *                 description: 支付方式（可选）
 *               attribution:
 *                 type: string
 *                 description: 归属（可选）
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: number 更新的记录数量
 *               }
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const { ids, bookId, flowType, industryType, payType, attribution } =
    await readBody(event); // 从请求体获取 ID
  // const userId = await getUserId(event);

  if (!ids || !bookId) {
    return error("Not Find ID");
  }

  const updateInfo: any = {};
  if (flowType) {
    updateInfo.flowType = String(flowType);
  }
  if (industryType) {
    updateInfo.industryType = String(industryType);
  }
  if (payType) {
    updateInfo.payType = String(payType);
  }
  if (attribution) {
    updateInfo.attribution = String(attribution);
  }

  const updated = await prisma.flow.updateMany({
    data: updateInfo,
    where: {
      id: {
        in: ids,
      },
    },
  });
  return success(updated);
});
