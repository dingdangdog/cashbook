import prisma from "~~/server/lib/prisma";
import { getUserId } from "~~/server/utils/jwt";
import { runChatAgent } from "~~/server/lib/ai";
import { success, error } from "~~/server/utils/common";

/**
 * AI 对话接口：支持会话记忆与持久化
 * 请求体: { sessionId?: number, content: string } 或兼容旧版 { messages: [{ role, content }] }
 */
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event);
  if (!userId) {
    return error("未授权或 token 无效");
  }

  const body = await readBody(event).catch(() => ({}));
  let sessionId: number | null = null;

  // 新格式：sessionId + content（会落库并带历史）
  if (body?.content != null && typeof body.content === "string") {
    const content = body.content.trim();
    if (!content) {
      return error("请输入内容");
    }

    let session = null;
    if (body.sessionId != null) {
      const sid = Number(body.sessionId);
      if (!Number.isNaN(sid)) {
        session = await prisma.userChatSession.findFirst({
          where: { id: sid, userId },
        });
        if (session) sessionId = session.id;
      }
    }
    if (!session) {
      session = await prisma.userChatSession.create({
        data: { userId, title: "新对话" },
      });
      sessionId = session.id;
    }

    // 首条用户消息时更新会话标题为摘要
    const msgCount = await prisma.userChatMessage.count({
      where: { sessionId: session!.id },
    });
    if (msgCount === 0 && session!.title === "新对话") {
      const title =
        content.length > 30 ? content.slice(0, 27) + "..." : content;
      await prisma.userChatSession.update({
        where: { id: session!.id },
        data: { title },
      });
    }

    await prisma.userChatMessage.create({
      data: {
        sessionId: session!.id,
        role: "user",
        content,
      },
    });

    const historyRows = await prisma.userChatMessage.findMany({
      where: { sessionId: session!.id },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });
    const messages = historyRows.map((r) => ({
      role: r.role as "user" | "assistant" | "system",
      content: r.content,
    }));

    const providerId =
      body.providerId != null && typeof body.providerId === "string"
        ? body.providerId.trim() || undefined
        : undefined;

    const result = await runChatAgent({
      userId,
      messages,
      maxToolRounds: 3,
      providerId,
    });

    await prisma.userChatMessage.create({
      data: {
        sessionId: session!.id,
        role: "assistant",
        content: result.content,
      },
    });

    return success({
      content: result.content,
      sessionId: session!.id,
    });
  }

  // 兼容旧格式：messages 数组（不落库）
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return error("请提供 content 或 messages 数组");
  }

  const valid = messages.every(
    (m: unknown) => m && typeof m === "object" && "role" in m && "content" in m,
  );
  if (!valid) {
    return error("每条消息需包含 role 和 content");
  }

  const providerId =
    body?.providerId != null && typeof body.providerId === "string"
      ? body.providerId.trim() || undefined
      : undefined;

  const result = await runChatAgent({
    userId,
    messages: messages as Parameters<typeof runChatAgent>[0]["messages"],
    maxToolRounds: 3,
    providerId,
  });

  return success({ content: result.content });
});
