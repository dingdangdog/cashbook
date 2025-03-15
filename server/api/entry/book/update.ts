import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { bookName, budget, bookId } = body;
  if (!bookId) {
    return error("Not Find bookID");
  }
  const updated = await prisma.book.updateMany({
    where: { bookId },
    data: {
      bookName,
      budget: Number(budget || 0),
    },
  });
  return success(updated);
});
