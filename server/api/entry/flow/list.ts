import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/list:
 *   post:
 *     summary: 获取流水记录列表
 *     tags: ["Flow"]
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
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: 账本ID
 *               id:
 *                 type: number
 *                 description: 流水ID（可选）
 *               flowType:
 *                 type: string
 *                 description: 流水类型（可选）
 *               industryType:
 *                 type: string
 *                 description: 行业分类（可选）
 *               payType:
 *                 type: string
 *                 description: 支付方式（可选）
 *               startDay:
 *                 type: string
 *                 description: 开始日期（可选）
 *               endDay:
 *                 type: string
 *                 description: 结束日期（可选）
 *               name:
 *                 type: string
 *                 description: 流水名称（可选，支持模糊查询）
 *               attribution:
 *                 type: string
 *                 description: 归属（可选，支持模糊查询）
 *               description:
 *                 type: string
 *                 description: 描述（可选，支持模糊查询）
 *     responses:
 *       200:
 *         description: 流水记录列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: [] #[Flow流水记录数组]
 *               }
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
  const body = await readBody(event); // 获取查询参数

  if (!body.bookId) {
    return error("请先选择账本");
  }
  // 条件查询
  const where: any = {
    bookId: body.bookId,
  };

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(body.id),
    };
  }
  // 类型条件
  if (body.flowType) {
    where.flowType = {
      equals: body.flowType,
    };
  }
  if (body.industryType) {
    where.industryType = {
      equals: body.industryType,
    };
  }
  if (body.payType) {
    where.payType = {
      equals: body.payType,
    };
  }

  // 时间条件
  if (body.startDay && body.endDay) {
    where.day = {
      gte: body.startDay,
      lte: body.endDay,
    };
  } else if (body.startDay) {
    where.day = {
      gte: body.startDay,
    };
  } else if (body.endDay) {
    where.day = {
      lte: body.endDay,
    };
  }

  // 模糊条件
  if (body.name) {
    where.name = {
      contains: body.name,
    };
  }
  if (body.attribution) {
    where.attribution = {
      contains: body.attribution,
    };
  }
  if (body.description) {
    where.description = {
      contains: body.description,
    };
  }

  const flows = await prisma.flow.findMany({
    where, // 使用条件查询
  });

  return success(flows);
});
