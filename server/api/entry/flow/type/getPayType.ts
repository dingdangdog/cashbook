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

  const flows = await prisma.flow.findMany({
    distinct: ["payType"],
    select: {
      payType: true,
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

  return success(flows);
});
