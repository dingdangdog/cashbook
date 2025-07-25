import prisma from "~/lib/prisma";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";

/**
 * @swagger
 * /api/admin/entry/settings/exportImg:
 *   get:
 *     summary: 管理员导出系统图片
 *     tags: ["Admin Settings"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 图片导出成功
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: 导出失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息
 *               }
 */
export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    let dataPath = String(runtimeConfig.dataPath);
    if (!dataPath) {
      dataPath = process.cwd();
    }
    const invoicePath = path.join(dataPath, "images");

    // 确保图片目录存在
    if (!fs.existsSync(invoicePath)) {
      return error("图片目录不存在");
    }

    // 读取所有图片文件
    const files = await fs.promises.readdir(invoicePath);

    // 创建一个新的ZIP文件
    const zip = new JSZip();

    // 图片信息数组，用于记录图片元数据
    const imageInfos = [];

    // 添加所有图片到ZIP文件
    for (const file of files) {
      const filePath = path.join(invoicePath, file);
      const stats = await fs.promises.stat(filePath);

      // 只处理文件，跳过目录
      if (stats.isFile()) {
        // 读取文件内容
        const fileData = await fs.promises.readFile(filePath);

        // 添加到ZIP文件
        zip.file(file, fileData);

        // 记录图片信息
        imageInfos.push({
          name: file,
          size: stats.size,
          lastModified: stats.mtime,
        });
      }
    }

    // 生成图片信息的JSON文件
    zip.file("image_info.json", JSON.stringify(imageInfos, null, 2));

    // 生成ZIP文件
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9, // 最高压缩级别
      },
    });

    // 设置响应头，指示这是一个ZIP文件
    event.node.res.setHeader(
      "Content-Disposition",
      'attachment; filename="images.zip"'
    );
    event.node.res.setHeader("Content-Type", "application/zip");

    // 返回ZIP文件
    return zipBuffer;
  } catch (err) {
    console.error("导出图片失败:", err);
    return error(
      "导出图片失败: " + (err instanceof Error ? err.message : String(err))
    );
  }
});
