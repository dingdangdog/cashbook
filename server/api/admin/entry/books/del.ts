import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/books/del:
 *   post:
 *     summary: 管理员删除账本
 *     tags: ["Admin Books"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 账本ID
 *     responses:
 *       200:
 *         description: 账本删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 删除的账本信息
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
  if (!id) {
    return error("Not Find ID");
  }
  // 删除数据
  const deleted = await prisma.book.delete({
    where: { id },
  });

  return success(deleted);
});
