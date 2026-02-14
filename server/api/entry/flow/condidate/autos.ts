import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/condidate/autos:
 *   post:
 *     summary: 自动查找候选平账记录
 *     tags: ["Candidate"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: {}
 *     responses:
 *       200:
 *         description: 候选记录获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #{ out: Flow 支出记录, in: Flow 收入记录}
 */
export default defineEventHandler(async (event) => {
  const expenditures = await prisma.flow.findMany({
    where: { flowType: "支出", eliminate: 0 },
    orderBy: [
      {
        day: "desc",
      },
    ],
  });

  const candidatePairs = [];

  // 对每笔支出查找候选记录
  for (const expense of expenditures) {
    const candidate = await prisma.flow.findFirst({
      where: {
        flowType: { in: ["收入", "不计收支"] },
        money: expense.money,
      },
    });
    if (candidate) {
      candidatePairs.push({
        out: expense,
        in: candidate,
      });
    }
  }

  return success(candidatePairs);
});
