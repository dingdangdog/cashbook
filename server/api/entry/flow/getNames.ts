import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/getNames:
 *   post:
 *     summary: 获取流水名称列表
 *     tags: ["Flow"]
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
 *         description: 流水名称列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[string流水名称数组]
 *       400:
 *         description: 获取失败
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

  const where: any = {
    bookId,
  };

  const flows = await prisma.flow.findMany({
    distinct: ["name"],
    select: {
      name: true,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
    where,
  });

  // 提取 name 属性并返回集合
  // const names = flows.map((flow) => flow.name);

  const names = flows
    .map((flow) => flow.name)
    .filter((attribution) => attribution && attribution.trim() !== "");

  return success(names);
});
