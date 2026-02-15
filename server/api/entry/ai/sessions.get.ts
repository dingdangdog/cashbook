import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { success, error } from "~~/server/utils/common";

/** GET /api/entry/ai/sessions - 获取当前用户的对话会话列表 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const sessions = await prisma.userChatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return success(sessions);
});
