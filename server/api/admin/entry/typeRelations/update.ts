import prisma from "~/lib/prisma";

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
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: number
 *                 description: 关系ID
 *               source:
 *                 type: string
 *                 description: 源类型
 *               target:
 *                 type: string
 *                 description: 目标类型
 *     responses:
 *       200:
 *         description: 类型关系更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 更新后的类型关系信息
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
