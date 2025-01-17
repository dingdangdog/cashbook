import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!query.bookId) {
    return error("Not Find BookId");
  }
  const flows = await prisma.flow.findMany({
    where: { bookId: String(query.bookId) },
  });
  return success(flows);
});
