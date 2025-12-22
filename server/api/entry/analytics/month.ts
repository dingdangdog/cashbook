import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/analytics/month:
 *   post:
 *     summary: 获取月度流水分析数据
 *     tags: ["Analytics"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             flowType: string 流水类型（可选）
 *             startDay: string 开始日期（可选）
 *             endDay: string 结束日期（可选）
 *             attribution: string 流水归属（可选）
 *     responses:
 *       200:
 *         description: 月度分析数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[CommonChartData图表通用数据结构：月度流水分析数据数组]
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

  const where: any = {
    bookId: {
      equals: body.bookId,
    },
  };
  if (body.flowType) {
    where.flowType = {
      equals: body.flowType,
    };
  }
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

  if (body.attribution) {
    where.attribution = {
      equals: body.attribution,
    };
  }

  // 使用 Prisma 的 groupBy 方法，按 day 和 flowType 分组
  const dayGroups = await prisma.flow.groupBy({
    by: ["day", "flowType"],
    _sum: {
      money: true,
    },
    where, // 使用条件查询
    orderBy: [
      {
        day: "asc",
      },
      {
        flowType: "asc",
      },
    ],
  });

  // 初始化结果格式
  const datas = [];
  const groupedByMonth: Record<
    string,
    {
      type: string;
      inSum: number;
      outSum: number;
      zeroSum: number;
    }
  > = {};

  // 按 day 分组，提取月份并合并数据到目标格式
  dayGroups.forEach((item) => {
    // 从 day 字段提取月份（格式：YYYY-MM-DD -> YYYY-MM）
    const month = item.day ? item.day.substring(0, 7) : "";
    if (!month) return;

    const flowType = item.flowType;
    const moneySum = item._sum.money || 0; // 如果 money 为 null，默认值为 0

    // 如果当前 month 不存在，则初始化
    if (!groupedByMonth[month]) {
      groupedByMonth[month] = {
        type: month,
        inSum: 0,
        outSum: 0,
        zeroSum: 0,
      };
    }

    // 根据 flowType 填充对应的 sum
    if (flowType === "收入") {
      groupedByMonth[month].inSum += moneySum;
    } else if (flowType === "支出") {
      groupedByMonth[month].outSum += moneySum;
    } else if (flowType === "不计收支") {
      groupedByMonth[month].zeroSum += moneySum;
    }
  });

  // 转换为数组格式
  for (const month in groupedByMonth) {
    groupedByMonth[month].inSum = parseFloat(
      groupedByMonth[month].inSum.toFixed(2)
    );
    groupedByMonth[month].outSum = parseFloat(
      groupedByMonth[month].outSum.toFixed(2)
    );
    groupedByMonth[month].zeroSum = parseFloat(
      groupedByMonth[month].zeroSum.toFixed(2)
    );
    datas.push(groupedByMonth[month]);
  }

  return success(datas);
});
