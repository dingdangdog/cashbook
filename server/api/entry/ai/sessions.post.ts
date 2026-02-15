import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { success, error } from "~~/server/utils/common";

/** POST /api/entry/ai/sessions - 创建新对话会话 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const session = await prisma.userChatSession.create({
    data: { userId, title: "新对话" },
  });

  return success(session);
});
