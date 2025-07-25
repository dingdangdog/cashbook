import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/books/update:
 *   post:
 *     summary: 管理员更新账本信息
 *     tags: ["Admin Books"]
 *     security:
 *       - Admin: []
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
 *               bookName:
 *                 type: string
 *                 description: 账本名称
 *     responses:
 *       200:
 *         description: 账本更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 更新后的账本信息
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
  const body = await readBody(event);
  const { id, bookName } = body;
  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.book.update({
    where: { id },
    data: {
      bookName,
    },
  });
  return success(updated);
});
