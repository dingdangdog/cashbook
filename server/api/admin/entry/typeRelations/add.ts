import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/typeRelations/add:
 *   post:
 *     summary: 管理员添加类型关系
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
 *               - source
 *               - target
 *             properties:
 *               source:
 *                 type: string
 *                 description: 源类型
 *               target:
 *                 type: string
 *                 description: 目标类型
 *     responses:
 *       200:
 *         description: 类型关系添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: 创建的类型关系信息
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  const { source, target } = body;

  // const userId = await getUserId(event);
  // 在数据库中添加新数据
  const created = await prisma.typeRelation.create({
    data: {
      userId: 0,
      bookId: "0",
      source,
      target,
    },
  });
  return success(created);
});
