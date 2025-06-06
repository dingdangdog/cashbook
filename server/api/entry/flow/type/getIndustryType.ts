import prisma from "~/lib/prisma";

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

  const flows = await prisma.flow.findMany({
    distinct: ["industryType"],
    select: {
      industryType: true,
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

  return success(flows);
});
