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
 *             bookId: string 账本ID
 *             types: [] #[TypeRelation类型关系数组]
 *     responses:
 *       200:
 *         description: 类型关系更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: TypeRelation
 *       400:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;
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
      t.bookId = bookId;
      creates.push(t);
    }
  });
  if (ids.length > 0) {
    await prisma.typeRelation.deleteMany({
      where: {
        id: { notIn: ids },
        bookId,
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
