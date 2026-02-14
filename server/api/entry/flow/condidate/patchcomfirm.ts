import prisma from "~~/server/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/entry/flow/condidate/patchcomfirm:
 *   post:
 *     summary: 批量确认候选平账记录
 *     tags: ["Candidate"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             items: { outId: number; inIds: number[] }[] 批量平账项
 *     responses:
 *       200:
 *         description: 批量平账确认成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: { count: number } 成功处理的记录数（out+in 总数）
 *       400:
 *         description: 确认失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Invalid params"）
 *               }
 */
const DEFAULT_BOOK_ID = "0";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bookId = body.bookId ? String(body.bookId) : DEFAULT_BOOK_ID;
  const items = body.items as Array<{ outId: number; inIds: number[] }> | undefined;

  if (!Array.isArray(items) || items.length === 0) {
    return error("Invalid params");
  }

  // 规范化与校验
  const normalized = items
    .map((it) => ({
      outId: Number(it.outId),
      inIds: Array.isArray(it.inIds)
        ? it.inIds.map((x) => Number(x)).filter((n) => Number.isFinite(n))
        : [],
    }))
    .filter((it) => Number.isFinite(it.outId) && it.inIds.length > 0);

  if (normalized.length === 0) {
    return error("Invalid params");
  }

  const txs: Prisma.PrismaPromise<any>[] = [];
  let affected = 0;

  for (const it of normalized) {
    // 更新支出记录
    txs.push(
      prisma.flow.update({
        where: { id: it.outId, bookId },
        data: {
          eliminate: 1,
          flowType: "不计收支",
        },
      })
    );
    affected += 1;
    // 更新对应收入记录
    txs.push(
      prisma.flow.updateMany({
        where: { id: { in: it.inIds }, bookId },
        data: {
          eliminate: 1,
          flowType: "不计收支",
        },
      })
    );
    affected += it.inIds.length;
  }

  await prisma.$transaction(txs);
  return success({ count: affected });
});
