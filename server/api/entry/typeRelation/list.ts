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
 *           schema: {}
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
  const relations = await prisma.typeRelation.findMany({
    orderBy: [
      {
        target: "asc",
      },
    ],
  });

  if (relations.length <= 0) {
    await initTypeRelation();

    const newRelations = await prisma.typeRelation.findMany({
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
