import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  const books = await prisma.book.findMany({ where: { userId } });
  return success(books);
});
