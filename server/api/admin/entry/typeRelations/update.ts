import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/typeRelations/update:
 *   post:
 *     summary: 管理员更新类型关系
 *     tags: ["Admin Type Relations"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 关系ID
 *             source: string 源类型
 *             target: string 目标类型
 *     responses:
 *       200:
 *         description: 类型关系更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: TypeRelation 更新后的类型关系信息
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
  const { id, target, source } = body;
  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.typeRelation.update({
    where: { id },
    data: {
      target,
      source,
    },
  });
  return success(updated);
});
