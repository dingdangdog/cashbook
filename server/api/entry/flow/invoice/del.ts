import * as fs from "fs";
import * as path from "path";
import prisma from "~/lib/prisma";
export default defineEventHandler(async (event) => {
  const { id, bookId, invoice } = await readBody(event);

  if (!id) {
    return error("Not Find ID");
  }

  if (!bookId) {
    return error("Not Find BookID");
  }

  if (!invoice) {
    return error("Not Find ImageName");
  }

  try {
    const runtimeConfig = useRuntimeConfig();
    let dataPath = String(runtimeConfig.dataPath);

    if (!dataPath) {
      dataPath = process.cwd();
    }

    const imagePath = path.join(dataPath, "images", String(invoice));

    const flow = await prisma.flow.findUnique({
      where: {
        id: Number(id),
        bookId: String(bookId),
      },
    });
    // 校验图片是否存在
    if (!fs.existsSync(imagePath)) {
      // 图片不存在 无需删除
    } else {
      // 删除文件
      await fs.promises.unlink(imagePath);
    }

    if (!flow) {
      return error("流水信息不存在");
    }
    const invoices = flow.invoice ? flow.invoice.split(",") : [];
    const newInvoices = invoices.filter((item) => item !== invoice);

    // 更新流水信息
    await prisma.flow.update({
      where: {
        id: Number(id),
        bookId: String(bookId),
      },
      data: {
        invoice: newInvoices.join(","),
      },
    });

    return success();
  } catch (err) {
    console.error(err);
    return error("小票删除失败");
  }
});
