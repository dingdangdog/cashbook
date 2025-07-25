import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/book/del:
 *   post:
 *     summary: 删除账本
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: number
 *                 description: 账本ID
 *     responses:
 *       200:
 *         description: 账本删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: Book 删除的账本信息
 *               }
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
  const { id } = await readBody(event); // 从请求体获取 ID
  const userId = await getUserId(event);

  if (!id) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.book.delete({
    where: { id, userId },
  });

  return success(deleted);
});
