import prisma from "~~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const body = await readBody(event);
  const id = Number(body.id);
  if (!id) {
    return error("Not Find ID");
  }

  const row = await prisma.fundAccount.findFirst({
    where: { id, userId },
  });
  if (!row) {
    return error("Not Find ID");
  }

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.flow.updateMany({
      where: { userId, accountId: id },
      data: {
        accountId: null,
        accountDelta: null,
        accountBal: null,
      },
    });
    return tx.fundAccount.delete({
      where: { id },
    });
  });

  return success(deleted);
});
