import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // const userId = await getUserId(event);
  const { id, bookId } = body;
  if (!id || !bookId) {
    return error("Not Find ID");
  }
  const updated = await prisma.flow.update({
    where: { id, bookId },
    data: {
      eliminate: -1,
    },
  });
  return success(updated);
});
