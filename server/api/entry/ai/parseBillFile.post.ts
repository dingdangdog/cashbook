import { getUserId } from "~~/server/utils/common";
import { parseFileToRows, parseBillDataWithAI } from "~~/server/lib/ai";
import { success, error } from "~~/server/utils/common";

/**
 * 上传 Excel/CSV 文件解析为 Flow 结构
 * Content-Type: multipart/form-data, 字段名: file
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");
  if (!file?.data) {
    return error("请上传 file 文件");
  }

  const rows = parseFileToRows(file.data);
  if (rows.length === 0) {
    return error("未能解析出有效数据行");
  }

  const result = await parseBillDataWithAI(rows);
  return success(result);
});
