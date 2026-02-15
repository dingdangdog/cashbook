import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { success, error } from "~~/server/utils/common";

/** DELETE /api/entry/ai/sessions/:id - 删除对话会话（及其消息） */
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

  await prisma.userChatSession.delete({
    where: { id: sessionId },
  });

  return success({ ok: true });
});
