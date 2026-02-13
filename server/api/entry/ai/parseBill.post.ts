import { getUserId } from "~~/server/utils/common";
import { parseBillDataWithAI } from "~~/server/lib/ai";
import { success, error } from "~~/server/utils/common";

/**
 * 账单数据解析接口：解析 Excel/CSV 原始行为本系统 Flow 结构
 * 请求体: { rows: Record<string, unknown>[] }
 * rows 为前端解析 Excel/CSV 得到的行数组，每行为键值对
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const body = await readBody(event).catch(() => ({}));
  const rows = body?.rows;
  if (!Array.isArray(rows)) {
    return error("请提供 rows 数组");
  }

  const valid = rows.every(
    (r: unknown) => r && typeof r === "object" && !Array.isArray(r),
  );
  if (!valid) {
    return error("每行需为对象");
  }

  const result = await parseBillDataWithAI(rows as Record<string, unknown>[]);
  return success(result);
});
