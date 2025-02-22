import * as fs from "fs";
import * as path from "path";
import prisma from "~/lib/prisma";

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
