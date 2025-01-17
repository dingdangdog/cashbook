import * as fs from "fs";
import * as path from "path";

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
