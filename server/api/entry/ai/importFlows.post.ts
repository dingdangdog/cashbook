import { getUserId } from "~~/server/utils/common";
import { parseBillDataWithAI } from "~~/server/lib/ai";
import { createFlow } from "~~/server/utils/db";
import { success, error } from "~~/server/utils/common";

function genFlowNo(): string {
  return `F${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 解析并导入账单：先 AI 解析，再批量写入数据库
 * 请求体: { rows: Record<string, unknown>[] }
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

  const { flows, errors } = await parseBillDataWithAI(
    rows as Record<string, unknown>[],
  );

  if (flows.length === 0) {
    return error(errors?.[0] || "未能解析出有效流水");
  }

  let imported = 0;
  const importErrors: string[] = [];

  for (const f of flows) {
    try {
      await createFlow({
        flowNo: genFlowNo(),
        userId,
        day: new Date(f.day),
        flowType: f.flowType,
        industryType: f.industryType,
        payType: f.payType,
        money: f.money,
        name: f.name,
        description: f.description || null,
        attribution: f.attribution || null,
        origin: "Excel/CSV导入-AI解析",
      });
      imported++;
    } catch (e) {
      importErrors.push(
        `导入失败 ${f.name} ${f.money}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  return success({
    imported,
    total: flows.length,
    parseErrors: errors,
    importErrors: importErrors.length ? importErrors : undefined,
  });
});
