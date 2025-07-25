import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/typeRelations/del:
 *   post:
 *     summary: 管理员删除类型关系
 *     tags: ["Admin Type Relations"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 关系ID
 *     responses:
 *       200:
 *         description: 类型关系删除成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: TypeRelation 删除的类型关系信息
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
  const deleted = await prisma.typeRelation.delete({
    where: { id },
  });

  return success(deleted);
});
