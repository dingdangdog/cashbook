import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/getAttributions:
 *   post:
 *     summary: 获取流水归属列表
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
 *         description: 流水归属列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[string归属名称数组]
 *       400:
 *         description: 获取失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "请先选择账本"
 *               }
 */
export default defineEventHandler(async (event) => {
  const { bookId } = await readBody(event);

  if (!bookId) {
    return error("请先选择账本");
  }

  const where: any = {
    bookId,
  };

  const flows = await prisma.flow.findMany({
    distinct: ["attribution"],
    select: {
      attribution: true,
    },
    orderBy: [
      {
        attribution: "asc",
      },
    ],
    where,
  });

  // 提取 attribution 属性并返回集合
  const names = flows
    .map((flow) => flow.attribution)
    .filter((attribution) => attribution && attribution.trim() !== "");

  return success(names);
});
