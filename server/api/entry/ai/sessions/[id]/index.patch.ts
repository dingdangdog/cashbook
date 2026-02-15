import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { success, error } from "~~/server/utils/common";

/** PATCH /api/entry/ai/sessions/:id - 更新会话标题 */
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

  const body = await readBody(event); // 获取请求体
  const title =
    body?.title === null || body?.title === ""
      ? null
      : typeof body?.title === "string"
        ? body.title.trim().slice(0, 200)
        : undefined;

  if (title === undefined) {
    return error("请提供 title 字段");
  }

  const session = await prisma.userChatSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) {
    return error("会话不存在或无权访问");
  }

  const updated = await prisma.userChatSession.update({
    where: { id: sessionId },
    data: { title: title || null },
  });

  return success({
    id: updated.id,
    title: updated.title,
    updatedAt: updated.updatedAt,
  });
});
