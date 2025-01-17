import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const books = await prisma.book.findMany();
  return success(books);
});
