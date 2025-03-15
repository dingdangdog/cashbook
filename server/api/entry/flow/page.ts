import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数

  if (!body.bookId) {
    return error("请先选择账本");
  }

  const where: any = {
    bookId: {
      equals: body.bookId,
    },
  }; // 条件查询

  // 普通查询条件
  if (body.id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(body.id),
    };
  }
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

  // 分页条件
  const pageNum = Number(body.pageNum ? body.pageNum : 1);
  const pageSize = Number(body.pageSize ? body.pageSize : 15);
  const skip = (pageNum - 1) * pageSize; // 计算跳过的条目数

  // 排序条件
  const orderBy: any = [
    {
      day: "desc",
    },
  ];
  if (body.moneySort) {
    // console.log(body.moneySort)
    // 将金额排序设置到第一个
    orderBy.unshift({ money: String(body.moneySort) });
  }
  let flows;
  if (pageSize == -1) {
    // 查询全部
    flows = await prisma.flow.findMany({ where, orderBy });
    // return success(books);
  } else {
    // 【条件、排序、分页】 组合查询
    flows = await prisma.flow.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    });
  }
  // 计算总页数
  const totalFlows = await prisma.flow.count({ where });
  const sumMoney = await prisma.flow.groupBy({
    by: ["flowType"],
    where,
    _sum: {
      money: true,
    },
  });
  const totalPages = Math.ceil(totalFlows / pageSize);
  // const sum = sumMoney[0];
  // console.log(sumMoney);
  let totalIn = 0;
  let totalOut = 0;
  let notInOut = 0;
  sumMoney.forEach((t) => {
    if (t.flowType == "收入") {
      totalIn = Number(t._sum.money);
    } else if (t.flowType == "支出") {
      totalOut = Number(t._sum.money);
    } else if (t.flowType == "不计收支") {
      notInOut = Number(t._sum.money);
    }
  });

  return success({
    total: totalFlows,
    data: flows,
    pages: totalPages,
    totalIn,
    totalOut,
    notInOut,
  });
});
