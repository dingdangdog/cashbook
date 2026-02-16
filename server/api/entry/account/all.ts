import prisma from "~~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const { status, accountType } = body;

  const where: any = { userId };
  if (status !== undefined && status !== null && status !== "") {
    where.status = Number(status);
  }
  if (accountType) {
    where.accountType = String(accountType);
  }

  const datas = await prisma.fundAccount.findMany({
    where,
    orderBy: [{ sortBy: "asc" }, { id: "desc" }],
  });
  return success(datas);
});
