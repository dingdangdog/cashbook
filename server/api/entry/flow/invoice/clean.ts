import * as fs from "fs";
import * as path from "path";
import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/entry/flow/invoice/clean:
 *   post:
 *     summary: 清理流水所有发票
 *     tags: ["Invoice"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             bookId: string 账本ID
 *             id: number 流水ID
 *     responses:
 *       200:
 *         description: 发票清理成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: string 操作结果
 *       400:
 *         description: 清理失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息（"Not Find ID" | "Not Find BookID" | "小票清空失败"）
 *               }
 */
export default defineEventHandler(async (event) => {
  const { id, bookId } = await readBody(event);

  if (!id) {
    return error("Not Find ID");
  }

  if (!bookId) {
    return error("Not Find BookID");
  }

  try {
    const flow = await prisma.flow.findUnique({
      where: {
        id: Number(id),
        bookId: String(bookId),
      },
    });

    if (!flow) {
      return;
    }

    const invoices = flow.invoice ? flow.invoice.split(",") : [];

    // 删除文件
    for (const invoice of invoices) {
      const runtimeConfig = useRuntimeConfig();
      let dataPath = String(runtimeConfig.dataPath);

      if (!dataPath) {
        dataPath = process.cwd();
      }

      const imagePath = path.join(dataPath, "images", invoice);

      // 校验图片是否存在
      if (fs.existsSync(imagePath)) {
        await fs.promises.unlink(imagePath);
      }
    }

    // 更新流水信息
    await prisma.flow.update({
      where: {
        id: Number(id),
        bookId: String(bookId),
      },
      data: {
        invoice: null,
      },
    });

    return success();
  } catch (err) {
    console.error(err);
    return error("小票清空失败");
  }
});
