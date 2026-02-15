import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { success, error } from "~~/server/utils/common";

/** GET /api/entry/ai/sessions/:id/messages - 获取指定会话的消息列表 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const id = getRouterParam(event, "id");
  if (!id) {
    return error("缺少会话 ID");
  }

  const sessionId = Number(id);
  if (Number.isNaN(sessionId)) {
    return error("无效的会话 ID");
  }

  const session = await prisma.userChatSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) {
    return error("会话不存在或无权访问");
  }

  const messages = await prisma.userChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return success(messages);
});
