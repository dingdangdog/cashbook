import prisma from "~/lib/prisma";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";

export default defineEventHandler(async (event) => {
  try {
    // 1. 读取上传的文件
    const data = await readMultipartFormData(event);
    if (!data) {
      return error("请上传文件");
    }
    const file = data.find((item) => item.name === "file");

    if (!file) {
      return error("请上传ZIP文件");
    }

    // 检查文件类型
    if (!file.filename?.toLowerCase().endsWith(".zip")) {
      return error("请上传ZIP格式的文件");
    }

    // 获取图片保存路径
    const runtimeConfig = useRuntimeConfig();
    let dataPath = String(runtimeConfig.dataPath);
    if (!dataPath) {
      dataPath = process.cwd();
    }
    const invoicePath = path.join(dataPath, "images");

    // 确保图片目录存在
    await fs.promises.mkdir(invoicePath, { recursive: true });

    // 读取ZIP文件内容
    const zipBuffer = file.data;
    const zip = new JSZip();

    // 解析ZIP文件
    const zipContent = await zip.loadAsync(zipBuffer);

    // 导入统计信息
    const importStats = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
    };

    // 遍历ZIP文件中的所有文件
    for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
      // 跳过目录和image_info.json文件
      if (zipEntry.dir || filename === "image_info.json") {
        continue;
      }

      importStats.total++;

      try {
        // 获取文件内容
        const content = await zipEntry.async("nodebuffer");

        // 构建保存路径
        const savePath = path.join(invoicePath, path.basename(filename));

        // 检查文件是否已存在
        const fileExists = fs.existsSync(savePath);

        // 写入文件
        await fs.promises.writeFile(savePath, content);

        if (fileExists) {
          importStats.skipped++;
        } else {
          importStats.imported++;
        }
      } catch (err) {
        console.error(`导入图片 ${filename} 失败:`, err);
        importStats.errors++;
      }
    }

    return success({
      message: `图片导入完成，共导入 ${importStats.imported} 个图片，跳过 ${importStats.skipped} 个已存在图片，失败 ${importStats.errors} 个`,
      stats: importStats,
    });
  } catch (err) {
    console.error("导入图片失败:", err);
    return error(
      "导入图片失败: " + (err instanceof Error ? err.message : String(err))
    );
  }
});
