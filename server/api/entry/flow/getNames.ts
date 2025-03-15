import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { bookId } = await readBody(event);

  if (!bookId) {
    return error("请先选择账本");
  }

  const where: any = {
    bookId,
  };

  const flows = await prisma.flow.findMany({
    distinct: ["name"],
    select: {
      name: true,
    },
    orderBy: [
      {
        name: "asc",
      },
    ],
    where,
  });

  // 提取 name 属性并返回集合
  // const names = flows.map((flow) => flow.name);

  const names = flows
    .map((flow) => flow.name)
    .filter((attribution) => attribution && attribution.trim() !== "");

  return success(names);
});
