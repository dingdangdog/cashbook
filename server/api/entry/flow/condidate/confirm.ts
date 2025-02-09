import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // const userId = await getUserId(event);
  const { outId, bookId, inIds } = body;
  if (!outId || !bookId) {
    return error("Not Find ID");
  }
  if (!inIds) {
    return error("Not Find IDS");
  }
  await prisma.flow.update({
    where: { id: outId, bookId },
    data: {
      eliminate: 1,
      flowType: "不计收支",
    },
  });
  inIds.forEach(async (id: any) => {
    await prisma.flow.update({
      where: { id: Number(id), bookId },
      data: {
        eliminate: 1,
        flowType: "不计收支",
      },
    });
  });
  return success();
});
