import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { success, error } from "~~/server/utils/common";

/**
 * 获取可用的 AI 服务商列表（仅 id、name，供普通用户端选择，不返回敏感字段）
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const list = await prisma.systemAIProvider.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return success(list);
});
