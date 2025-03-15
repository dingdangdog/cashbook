import * as fs from "fs";
import * as path from "path";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const formdata = await readFormData(event);
  try {
    const bookId = String(formdata.get("bookId"));
    if (!bookId) {
      return error("请先选择账本");
    }
    const files: File[] = formdata.getAll("invoice") as File[];
    if (!files || files.length < 1) {
      return error("Not Find File");
    }
    // console.log(formdata.getAll("images"));
    const flowId = Number(formdata.get("id"));
    if (!flowId) {
      return error("Not Find ID");
    }
    const runtimeConfig = useRuntimeConfig();
    let dataPath = String(runtimeConfig.dataPath);
    if (!dataPath) {
      dataPath = process.cwd();
    }
    const invoicePath = path.join(dataPath, "images");
    // 确保保存路径存在
    await fs.promises.mkdir(invoicePath, { recursive: true });

    const imageNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 获取文件扩展名
      const extension = path.extname(file.name);
      const fileName = `${bookId}-${flowId}-${Date.now()}-${i + 1}${extension}`;

      // 读取文件数据
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // 对于不支持处理的格式，如svg、ico，直接保存
      await fs.promises.writeFile(path.join(invoicePath, fileName), fileBuffer);
      imageNames.push(fileName);
    }
    const flow = await prisma.flow.findUnique({
      where: {
        id: flowId,
        bookId,
      },
    });
    if (!flow) {
      return;
    }
    const newInvoices = [];
    if (flow.invoice) {
      newInvoices.push(...flow.invoice.split(","));
    }
    newInvoices.push(...imageNames);
    // 更新流水信息
    await prisma.flow.update({
      where: {
        id: flowId,
        bookId,
      },
      data: {
        invoice: newInvoices.join(","),
      },
    });

    return success();
  } catch (err) {
    console.error(err);
    return error("小票上传失败");
  }
});
