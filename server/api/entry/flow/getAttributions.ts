import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { bookId } = await readBody(event);

  if (!bookId) {
    return error("Not Find BookId");
  }

  const where: any = {
    bookId,
  };

  const flows = await prisma.flow.findMany({
    distinct: ["attribution"],
    select: {
      attribution: true,
    },
    orderBy: [
      {
        attribution: "asc",
      },
    ],
    where,
  });

  // 提取 attribution 属性并返回集合
  const names = flows
    .map((flow) => flow.attribution)
    .filter((attribution) => attribution && attribution.trim() !== "");

  return success(names);
});
