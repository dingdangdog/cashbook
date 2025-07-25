import prisma from "~/lib/prisma";
import { getUUID } from "~/utils/common";

/**
 * @swagger
 * /api/entry/book/add:
 *   post:
 *     summary: 添加账本
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookName: string 账本名称
 *             budget: number 预算金额（可选，默认为0）
 *     responses:
 *       200:
 *         description: 账本添加成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Book 创建的账本信息
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体
  const { bookName, budget } = body;

  const userId = await getUserId(event);

  const bookId = userId + "-" + getUUID(8);
  // 在数据库中添加新数据
  const created = await prisma.book.create({
    data: {
      bookId,
      userId,
      bookName,
      budget: Number(budget || 0),
    },
  });

  // 初始化 book 的 TypeRelation 数据
  const dTypes = await prisma.typeRelation.findMany({
    where: {
      bookId: "0",
      userId: 0,
    },
  });

  const newTypes: any = [];
  dTypes.forEach((t) => {
    newTypes.push({
      bookId,
      userId,
      source: t.source,
      target: t.target,
    });
  });
  await prisma.typeRelation.createMany({
    data: newTypes,
  });

  return success(created);
});
