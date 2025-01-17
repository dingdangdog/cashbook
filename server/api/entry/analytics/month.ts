import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数
  if (!body.bookId) {
    return error("Not Find BookId");
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
  const monthGroups: any[] = await prisma.$queryRaw`
    SELECT 
      SUBSTRING(day, 1, 7) AS month,
      "flowType",
      SUM("money") AS money_sum
    FROM "Flow"
    WHERE "bookId" = ${String(body.bookId)}
    GROUP BY SUBSTRING(day, 1, 7), "flowType"
    ORDER BY month ASC, "flowType" ASC;
  `;

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
