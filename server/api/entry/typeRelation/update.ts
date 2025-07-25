import prisma from "~/lib/prisma";

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
 *             type: object
 *             required:
 *               - bookId
 *               - types
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               types:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       description: 关系ID（可选，新增时不需要）
 *                     source:
 *                       type: string
 *                       description: 源类型
 *                     target:
 *                       type: string
 *                       description: 目标类型
 *                 description: 类型关系数组
 *     responses:
 *       200:
 *         description: 类型关系更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: TypeRelation
 *               }
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.bookId) {
    return error("请先选择账本");
  }
  const userId = await getUserId(event);
  const types: any[] = body.types;
  const updates: any[] = [];
  const creates: any[] = [];
  const ids: number[] = [];
  // console.log(types);
  types.forEach((t) => {
    if (t.id) {
      ids.push(t.id);
      updates.push(t);
    } else {
      t.userId = userId;
      creates.push(t);
    }
  });
  // console.log(updates);
  // console.log(creates);
  if (ids.length > 0) {
    // 删除原有但是现在没有的类型配置（删除了）
    await prisma.typeRelation.deleteMany({
      where: {
        id: {
          notIn: ids,
        },
        bookId: body.bookId,
      },
    });
    // 更新有ID的原有配置
    for (let t of updates) {
      const updated = await prisma.typeRelation.updateMany({
        data: t,
        where: {
          id: t.id,
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
