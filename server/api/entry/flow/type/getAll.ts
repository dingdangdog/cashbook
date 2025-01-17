import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { bookId, flowType } = await readBody(event); // 获取查询参数

  if (!bookId) {
    return error("Not Find BookId");
  }
  const where: any = {
    bookId,
  }; // 条件查询

  if (flowType) {
    where.flowType = {
      equals: flowType,
    };
  }

  const industryTypes = await prisma.flow.findMany({
    distinct: ["industryType"],
    select: {
      industryType: true,
      flowType: true,
    },
    orderBy: [
      {
        flowType: "asc",
      },
      {
        industryType: "asc",
      },
    ],
    where, // 使用条件查询
  });
  const payTypes = await prisma.flow.findMany({
    distinct: ["payType"],
    select: {
      payType: true,
      flowType: true,
    },
    orderBy: [
      {
        flowType: "asc",
      },
      {
        payType: "asc",
      },
    ],
    where, // 使用条件查询
  });

  // console.log(industryTypes);
  // console.log(payTypes);
  const types: any = [];
  industryTypes.forEach((t) => {
    types.push({
      type: "支出类型/收入类型",
      flowType: t.flowType,
      value: t.industryType,
    });
  });
  payTypes.forEach((t) => {
    types.push({
      type: "支付方式/收款方式",
      flowType: t.flowType,
      value: t.payType,
    });
  });

  return success(types);
});
