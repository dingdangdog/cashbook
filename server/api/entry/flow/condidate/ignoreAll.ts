import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/condidate/ignoreAll:
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
 *             ids: number[] 流水记录ID数组
 *     responses:
 *       200:
 *         description: 批量忽略成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: number 更新的记录数量
 *               }
 *       400:
 *         description: 忽略失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Not Find ID" | "无数据"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // const userId = await getUserId(event);
  const { ids, bookId } = body;
  if (!ids || !bookId) {
    return error("Not Find ID");
  }
  if (ids.length <= 0) {
    return error("无数据");
  }
  const idsJoin = ids.join(",");
  // console.log(
  //   `UPDATE "Flow" SET "eliminate" = -1 WHERE "bookId" = \"${String(
  //     bookId
  //   )}\" AND "id" in (${idsJoin});`
  // );
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "Flow" SET "eliminate" = -1 WHERE "bookId" = '${String(
      bookId
    )}' AND "id" in (${idsJoin});`
  );

  return success(updated);
});
