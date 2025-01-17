import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, bookName } = body;
  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.book.update({
    where: { id },
    data: {
      bookName,
    },
  });
  return success(updated);
});
