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
    by: ["payType", "flowType"],
    _sum: {
      money: true,
    },
    orderBy: [
      {
        payType: "asc",
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
    let payType = item.payType;
    if (!payType) {
      payType = "未知";
    }
    const flowType = item.flowType;
    const moneySum = item._sum.money || 0; // 如果 money 为 null，默认值为 0

    // 如果当前 day 不存在，则初始化
    if (!acc[payType]) {
      acc[payType] = {
        type: payType,
        inSum: 0,
        outSum: 0,
        zeroSum: 0,
      };
    }

    // 根据 flowType 填充对应的 sum
    if (flowType === "收入") {
      acc[payType].inSum += moneySum;
    } else if (flowType === "支出") {
      acc[payType].outSum += moneySum;
    } else if (flowType === "不计收支") {
      acc[payType].zeroSum += moneySum;
    }

    return acc;
  }, groupedByPayType);

  // 转换为数组格式
  for (const payType in groupedByPayType) {
    datas.push(groupedByPayType[payType]);
  }
  return success(datas);
});
