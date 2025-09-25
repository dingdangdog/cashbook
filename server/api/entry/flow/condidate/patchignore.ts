import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/condidate/patchignore:
 *   post:
 *     summary: 批量忽略候选平账记录
 *     tags: ["Candidate"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             ids: number[] 流水记录ID列表（通常为需要忽略的支出侧ID）
 *     responses:
 *       200:
 *         description: 批量忽略成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: { count: number } 影响条数
 *       400:
 *         description: 批量忽略失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: string
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ids, bookId } = body as { ids?: number[]; bookId?: string };
  if (!bookId || !Array.isArray(ids) || ids.length === 0) {
    return error("Invalid params: ids and bookId are required");
  }

  const result = await prisma.flow.updateMany({
    where: {
      id: { in: ids },
      bookId,
    },
    data: {
      eliminate: -1,
    },
  });

  return success({ count: result.count });
});
