import { getUserId } from "~~/server/utils/common";
import { runChatAgent } from "~~/server/lib/ai";
import { success, error } from "~~/server/utils/common";

/**
 * AI 对话接口：解析用户意图并执行记账/统计/查询
 * 请求体: { messages: [{ role, content }] }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const body = await readBody(event).catch(() => ({}));
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return error("请提供 messages 数组");
  }

  const valid = messages.every(
    (m: unknown) =>
      m && typeof m === "object" && "role" in m && "content" in m,
  );
  if (!valid) {
    return error("每条消息需包含 role 和 content");
  }

  const result = await runChatAgent({
    userId,
    messages: messages as { role: string; content: string }[],
    maxToolRounds: 3,
  });

  return success({ content: result.content });
});
