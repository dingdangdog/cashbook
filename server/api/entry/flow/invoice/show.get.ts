import * as fs from "fs";
import * as path from "path";

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
  // 获取文件路径参数
  // const file = decodeURIComponent(getRouterParam(event, "file") || "");
  const { invoice } = getQuery(event);

  // 检查文件是否存在
  if (invoice) {
    const runtimeConfig = useRuntimeConfig();
    let dataPath = String(runtimeConfig.dataPath);
    if (!dataPath) {
      dataPath = process.cwd();
    }
    const invoicePath = path.join(dataPath, "images");
    const basePath = path.join(invoicePath, String(invoice)); // 替换为你的实际路径
    // 如果格式不支持，直接返回原图
    return sendStream(event, fs.createReadStream(basePath));
  }
});
