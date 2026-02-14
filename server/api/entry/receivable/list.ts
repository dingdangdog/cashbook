import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/receivable/list:
 *   post:
 *     summary: 获取待收款列表（分页）
 *     tags: ["Receivable"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             pageNum: number 页码（可选，默认1）
 *             pageSize: number 每页数量（可选，默认20）
 *             name: string 名称模糊查询（可选）
 *             status: number 状态过滤（可选）
 *             startDay: string 开始日期过滤（可选）
 *             endDay: string 结束日期过滤（可选）
 *     responses:
 *       200:
 *         description: 待收款列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: {
 *                   datas: Receivable[],
 *                   total: number,
 *                   pageNum: number,
 *                   pageSize: number
 *                 }
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
  const {
    pageNum = 1,
    pageSize = 20,
    name,
    status,
    startDay,
    endDay,
  } = body;

  const where: any = {
    bookId,
  }; // 条件查询

  // 添加条件查询
  if (body.id) {
    where.id = {
      equals: Number(body.id),
    };
  }

  if (name) {
    where.name = {
      contains: name,
    };
  }

  if (status !== undefined && status !== null) {
    where.status = {
      equals: Number(status),
    };
  }

  if (startDay) {
    where.occurDay = {
      ...where.occurDay,
      gte: new Date(startDay),
    };
  }

  if (endDay) {
    where.occurDay = {
      ...where.occurDay,
      lte: new Date(endDay),
    };
  }

  // 计算分页参数
  const skip = (Number(pageNum) - 1) * Number(pageSize);
  const take = Number(pageSize);

  // 获取总数和数据
  const [total, datas] = await Promise.all([
    prisma.receivable.count({ where }),
    prisma.receivable.findMany({
      where,
      orderBy: {
        occurDay: "desc", // 按发生日期降序排列
      },
      skip,
      take,
    }),
  ]);

  return success({
    datas,
    total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  });
});
