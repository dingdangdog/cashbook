import * as fs from "fs";
import * as path from "path";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // 获取文件路径参数
  // const file = decodeURIComponent(getRouterParam(event, "file") || "");
  const { id, bookId, invoice } = await readBody(event);
  if (!id || !bookId) {
    return error("Not Find ID");
  }

  // 检查文件是否存在
  if (invoice) {
    const flow = await prisma.flow.findUnique({
      where: {
        id: Number(id),
        bookId: String(bookId),
      },
    });
    if (!flow) {
      return;
    }
    if (flow.invoice) {
      const flowInvoices = flow.invoice.split(",");
      const newInvoices = flowInvoices.filter((inv) => inv !== invoice);

      // newInvoices.push(...imageNames);
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
    }

    const runtimeConfig = useRuntimeConfig();
    let dataPath = String(runtimeConfig.dataPath);
    if (!dataPath) {
      dataPath = process.cwd();
    }
    const invoicePath = path.join(dataPath, "images");
    const inviceFile = path.join(invoicePath, String(invoice)); // 替换为你的实际路径
    fs.unlinkSync(inviceFile);
    // 如果格式不支持，直接返回原图
    return success("");
  }
  return error("error");
});
