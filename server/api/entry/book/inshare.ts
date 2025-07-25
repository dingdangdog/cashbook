import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/book/inshare:
 *   post:
 *     summary: 通过分享密钥加入账本
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: 分享密钥
 *     responses:
 *       200:
 *         description: 成功加入共享账本
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: Book 加入的账本信息
 *               }
 *       400:
 *         description: 加入失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Not Find key" | "账本已存在" | "无效Key！"）
 *               }
 */
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
