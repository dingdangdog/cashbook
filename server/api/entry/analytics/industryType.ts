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
