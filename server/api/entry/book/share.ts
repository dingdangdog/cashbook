import prisma from "~~/server/lib/prisma";
import { getUUID } from "~/utils/common";

/**
 * @swagger
 * /api/entry/book/share:
 *   post:
 *     summary: 生成账本分享密钥
 *     tags: ["Book"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             id: number 账本ID
 *     responses:
 *       200:
 *         description: 分享密钥生成成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: Book 更新后的账本信息
 *       400:
 *         description: 生成失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: "Not Find ID"
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);
  const { id } = body;
  if (!id) {
    return error("Not Find ID");
  }

  // 生成共享密钥
  const key = getUUID(8);
  const shareKey = `${userId}${id}${key}`;

  const updated = await prisma.book.update({
    where: { id, userId },
    data: {
      shareKey,
    },
  });
  return success(updated);
});
