import prisma from "~~/server/lib/prisma";

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
 *             ids: number[] 流水ID数组
 *             flowType: string 流水类型（可选）
 *             industryType: string 行业分类（可选）
 *             payType: string 支付方式（可选）
 *             attribution: string 归属（可选）
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: number 更新的记录数量
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
  const userId = await getUserId(event);
  const body = await readBody(event);
  const ids = body.ids;
  const { flowType, industryType, payType, attribution } = body;

  if (!ids) {
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
      id: { in: ids },
      userId,
    },
  });
  return success(updated);
});
