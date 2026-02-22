import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/analytics/attribution:
 *   post:
 *     summary: 获取归属分析数据
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
 *         description: 归属分析数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: [] #[CommonChartData图表通用数据结构：归属分析数据数组]
 *       400:
 *         description: 获取失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "不支持的分组字段"
 *               }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event); // 获取查询参数
  const where: any = { userId };
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
    by: ["attribution", "flowType"],
    _sum: {
      money: true,
    },
    orderBy: [
      {
        attribution: "asc",
      },
      {
        flowType: "asc",
      },
    ],
    where, // 使用条件查询
  });

  // 初始化结果格式
  const datas = [];
  const groupedByPayType: Record<
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
    let attribution = item.attribution;
    if (!attribution) {
      attribution = "未知";
    }
    const flowType = item.flowType;
    const raw = item._sum.money || 0;
    const moneySum =
      flowType === "收入" || flowType === "支出" ? Math.abs(raw) : raw;

    // 如果当前 day 不存在，则初始化
    if (!acc[attribution]) {
      acc[attribution] = {
        type: attribution,
        inSum: 0,
        outSum: 0,
        zeroSum: 0,
      };
    }

    // 根据 flowType 填充对应的 sum
    if (flowType === "收入") {
      acc[attribution].inSum += moneySum;
    } else if (flowType === "支出") {
      acc[attribution].outSum += moneySum;
    } else if (flowType === "不计收支") {
      acc[attribution].zeroSum += moneySum;
    }

    return acc;
  }, groupedByPayType);

  // 转换为数组格式
  for (const attribution in groupedByPayType) {
    datas.push(groupedByPayType[attribution]);
  }
  return success(datas);
});
