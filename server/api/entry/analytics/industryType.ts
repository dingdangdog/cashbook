import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/analytics/industryType:
 *   post:
 *     summary: 获取行业类型分析数据
 *     tags: ["Analytics"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             flowType: string 流水类型（可选）
 *             startDay: string 开始日期（可选）
 *             endDay: string 结束日期（可选）
 *     responses:
 *       200:
 *         description: 行业类型分析数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[CommonChartData图表通用数据结构：行业类型分析数据数组]
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const where: any = {};
  if (body.flowType) {
    where.flowType = {
      equals: body.flowType,
    };
  }
  if (body.startDay && body.endDay) {
    where.day = {
      gte: new Date(body.startDay),
      lte: new Date(body.endDay),
    };
  } else if (body.startDay) {
    where.day = {
      gte: new Date(body.startDay),
    };
  } else if (body.endDay) {
    where.day = {
      lte: new Date(body.endDay),
    };
  }

  // flowType = 收入 / 支出 / 不计收支
  const dayGroups = await prisma.flow.groupBy({
    by: ["industryType", "flowType"],
    _sum: {
      money: true,
    },
    orderBy: [
      {
        industryType: "asc",
      },
      {
        flowType: "asc",
      },
    ],
    where, // 使用条件查询
  });

  // 初始化结果格式
  const datas = [];
  const groupedByIndustry: Record<
    string,
    {
      type: string;
      inSum: number;
      outSum: number;
      zeroSum: number;
    }
  > = {};

  // 按 day 分组，合并数据到目标格式
  dayGroups.reduce((acc, item) => {
    let industryType = item.industryType;
    if (!industryType) {
      industryType = "未知";
    }
    const flowType = item.flowType;
    const moneySum = item._sum.money || 0; // 如果 money 为 null，默认值为 0

    // 如果当前 day 不存在，则初始化
    if (!acc[industryType]) {
      acc[industryType] = {
        type: industryType,
        inSum: 0,
        outSum: 0,
        zeroSum: 0,
      };
    }

    // 根据 flowType 填充对应的 sum
    if (flowType === "收入") {
      acc[industryType].inSum += moneySum;
    } else if (flowType === "支出") {
      acc[industryType].outSum += moneySum;
    } else if (flowType === "不计收支") {
      acc[industryType].zeroSum += moneySum;
    }

    return acc;
  }, groupedByIndustry);

  // 转换为数组格式
  for (const industryType in groupedByIndustry) {
    datas.push(groupedByIndustry[industryType]);
  }
  return success(datas);
});
