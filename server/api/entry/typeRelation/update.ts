import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/typeRelation/update:
 *   post:
 *     summary: 更新类型关系
 *     tags: ["Type Relation"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             types: [] #[TypeRelation类型关系数组]
 *     responses:
 *       200:
 *         description: 类型关系更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: TypeRelation
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const types: any[] = body.types;
  const updates: any[] = [];
  const creates: any[] = [];
  const ids: number[] = [];
  types.forEach((t) => {
    if (t.id) {
      ids.push(t.id);
      updates.push(t);
    } else {
      t.userId = userId;
      creates.push(t);
    }
  });
  if (ids.length > 0) {
    await prisma.typeRelation.deleteMany({
      where: {
        userId,
        id: { notIn: ids },
      },
    });
    // 更新有ID的原有配置（仅当前用户）
    for (let t of updates) {
      await prisma.typeRelation.updateMany({
        data: t,
        where: {
          id: t.id,
          userId,
        },
      });
    }
  }
  // 创建没有ID的新配置
  const created = await prisma.typeRelation.createMany({
    data: creates,
  });

  return success(created);
});
