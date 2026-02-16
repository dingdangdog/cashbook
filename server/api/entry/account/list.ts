import prisma from "~~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const {
    pageNum = 1,
    pageSize = 20,
    status,
    accountType,
    keyword,
    name,
  } = body;

  const where: any = { userId };
  if (status !== undefined && status !== null && status !== "") {
    where.status = Number(status);
  }
  if (accountType) {
    where.accountType = String(accountType);
  }
  if (name) {
    where.name = { contains: String(name), mode: "insensitive" };
  }
  if (keyword) {
    where.OR = [
      { name: { contains: String(keyword), mode: "insensitive" } },
      { institution: { contains: String(keyword), mode: "insensitive" } },
      { accountNo: { contains: String(keyword), mode: "insensitive" } },
      { description: { contains: String(keyword), mode: "insensitive" } },
    ];
  }

  const skip = (Number(pageNum) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const [total, datas] = await Promise.all([
    prisma.fundAccount.count({ where }),
    prisma.fundAccount.findMany({
      where,
      orderBy: [{ sortBy: "asc" }, { id: "desc" }],
      skip,
      take,
    }),
  ]);

  return success({
    datas,
    total,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  });
});
