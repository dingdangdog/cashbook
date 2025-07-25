import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/dels:
 *   post:
 *     summary: 批量删除流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             ids: number[] 流水ID数组
 *             bookId: string 账本ID
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: number 删除的记录数量
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const { ids, bookId } = await readBody(event); // 从请求体获取 ID
  // const userId = await getUserId(event);

  if (!ids || !bookId) {
    return error("Not Find ID");
  }
  const deleted = await prisma.flow.deleteMany({
    where: {
      id: {
        in: ids,
      },
      bookId: String(bookId),
    },
  });
  return success(deleted);
});
