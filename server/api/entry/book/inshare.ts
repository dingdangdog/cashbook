import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const { key } = body;
  if (!key) {
    return error("Not Find key");
  }
  const books = await prisma.book.findMany({
    where: {
      shareKey: {
        equals: String(key),
      },
    },
  });
  if (books.length > 0) {
    if (books.filter((b) => (b.userId == userId)).length > 0) {
      return error("账本已存在");
    }
    const book = books[0];
    await prisma.book.create({
      data: {
        userId,
        bookId: book.bookId,
        bookName: book.bookName,
        createDate: book.createDate,
        shareKey: book.shareKey,
      },
    });
  } else {
    return error("无效Key！");
  }

  return success();
});
