import prisma from "~~/server/lib/prisma";
import { initTypeRelation } from "~~/server/utils/data";

/**
 * @swagger
 * /api/entry/typeRelation/list:
 *   post:
 *     summary: 获取类型关系列表
 *     tags: ["Type Relation"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *     responses:
 *       200:
 *         description: 类型关系列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[TypeRelation类型关系列表数组]
 */
export default defineEventHandler(async (event) => {
  const { bookId } = await readBody(event); // 获取查询参数
  // const userId = await getUserId(event);

  if (!bookId) {
    return;
  }
  const where: any = {
    // userId,
    bookId: String(bookId),
  }; // 条件查询

  const relations = await prisma.typeRelation.findMany({
    where, // 使用条件查询
    orderBy: [
      {
        target: "asc",
      },
    ],
  });

  // const datas: Record<string, string> = {};
  // relations.forEach((l) => {
  //   datas[l.source] = l.target;
  // });

  if (relations.length <= 0) {
    await initTypeRelation(String(bookId));

    const newRelations = await prisma.typeRelation.findMany({
      where, // 使用条件查询
      orderBy: [
        {
          target: "asc",
        },
      ],
    });
    return success(newRelations);
  }

  return success(relations);
});
