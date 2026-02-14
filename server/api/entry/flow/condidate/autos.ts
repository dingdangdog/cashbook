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
 *           schema:
 *             bookId: string 账本ID
 *     responses:
 *       200:
 *         description: 候选记录获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #{ out: Flow 支出记录, in: Flow 收入记录}
 *       400:
 *         description: 获取失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "No Find bookid"
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;

  const expenditures = await prisma.flow.findMany({
    where: { flowType: "支出", eliminate: 0, bookId },
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
        bookId,
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
