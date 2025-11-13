import prisma from "~/lib/prisma";
import { Prisma } from "@prisma/client";

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

  // flowType = 收入 / 支出 / 不计收支
  // 使用 `to_char` 将日期按月份分组 (PostgreSQL 支持)
  // 构建 WHERE 条件
  if (body.attribution) {
    where.attribution = {
      equals: body.attribution,
    };
  }

  // 使用 Prisma.sql 进行参数化查询
  let sqlQuery: Prisma.Sql;
  if (body.attribution) {
    sqlQuery = Prisma.sql`
      SELECT 
        SUBSTRING(day, 1, 7) AS month,
        "flowType",
        SUM("money") AS money_sum
      FROM "Flow"
      WHERE "bookId" = ${String(body.bookId)}
        AND "attribution" = ${body.attribution}
      GROUP BY SUBSTRING(day, 1, 7), "flowType"
      ORDER BY month ASC, "flowType" ASC;
    `;
  } else {
    sqlQuery = Prisma.sql`
      SELECT 
        SUBSTRING(day, 1, 7) AS month,
        "flowType",
        SUM("money") AS money_sum
      FROM "Flow"
      WHERE "bookId" = ${String(body.bookId)}
      GROUP BY SUBSTRING(day, 1, 7), "flowType"
      ORDER BY month ASC, "flowType" ASC;
    `;
  }

  const monthGroups: any[] = await prisma.$queryRaw(sqlQuery);

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
  // 按 month 分组，合并数据到目标格式
  monthGroups.forEach((item: any) => {
    const month = item.month;
    const flowType = item.flowType;
    const moneySum = parseFloat(item.money_sum) || 0; // 防止 NULL 转为数字

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
  for (const day in groupedByMonth) {
    datas.push(groupedByMonth[day]);
  }
  return success(datas);
});
