import * as fs from "fs";
import * as path from "path";
import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/invoice/show:
 *   get:
 *     summary: 显示发票图片
 *     tags: ["Invoice"]
 *     parameters:
 *       - in: query
 *         name: invoice
 *         required: true
 *         schema:
 *           type: string
 *         description: 发票文件名
 *     responses:
 *       200:
 *         description: 发票图片
 *         content:
 *           image/*:
 *             schema:
 *               Blob: 文件流，前端直接显示图片
 */
export default defineEventHandler(async (event) => {
  const { invoice } = getQuery(event);
  if (!invoice) return;

  const userId = await getUserId(event);
  const invoiceStr = String(invoice);
  const flowId = Number(invoiceStr.split("-")[0]);
  if (!Number.isFinite(flowId)) {
    throw createError({ statusCode: 403 });
  }
  const flow = await prisma.flow.findFirst({
    where: { id: flowId, userId },
  });
  if (!flow) {
    throw createError({ statusCode: 403 });
  }

  const runtimeConfig = useRuntimeConfig();
  let dataPath = String(runtimeConfig.dataPath);
  if (!dataPath) {
    dataPath = process.cwd();
  }
  const invoicePath = path.join(dataPath, "images");
  const basePath = path.join(invoicePath, invoiceStr);
  return sendStream(event, fs.createReadStream(basePath));
});
