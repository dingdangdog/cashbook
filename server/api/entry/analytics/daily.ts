import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/analytics/daily:
 *   post:
 *     summary: 获取日常流水分析数据
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
 *     responses:
 *       200:
 *         description: 日常分析数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[CommonChartData图表通用数据结构：日常流水分析数据数组]
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
  const { bookId, flowType } = await readBody(event); // 获取查询参数
  if (!bookId) {
    return error("请先选择账本");
  }

  const where: any = {
    bookId,
  }; // 条件查询

  if (flowType) {
    where.flowType = {
      equals: flowType,
    };
  }

  // flowType = 收入 / 支出 / 不计收支
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
  const groupedByDay: Record<
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
    const day = item.day;
    const flowType = item.flowType;
    const moneySum = item._sum.money || 0; // 如果 money 为 null，默认值为 0

    // 如果当前 day 不存在，则初始化
    if (!acc[day]) {
      acc[day] = {
        type: day,
        inSum: 0,
        outSum: 0,
        zeroSum: 0,
      };
    }

    // 根据 flowType 填充对应的 sum
    if (flowType === "收入") {
      acc[day].inSum += moneySum;
    } else if (flowType === "支出") {
      acc[day].outSum += moneySum;
    } else if (flowType === "不计收支") {
      acc[day].zeroSum += moneySum;
    }

    return acc;
  }, groupedByDay);

  // 转换为数组格式
  for (const day in groupedByDay) {
    groupedByDay[day].inSum = parseFloat(groupedByDay[day].inSum.toFixed(2));
    groupedByDay[day].outSum = parseFloat(groupedByDay[day].outSum.toFixed(2));
    groupedByDay[day].zeroSum = parseFloat(
      groupedByDay[day].zeroSum.toFixed(2)
    );
    datas.push(groupedByDay[day]);
  }
  return success(datas);
});
