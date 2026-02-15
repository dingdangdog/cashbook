import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getAIClient } from "./client";
import { getAIProviderConfig } from "./client";
import { CHAT_TOOLS, executeTool } from "./tools";

const SYSTEM_PROMPT = `你是个人记账助手的 AI，帮助用户完成：
1. 对话式记账：用户说"今天午饭花了50"、"记一笔工资收入5000"等，你调用 add_flow 添加流水
2. 对话式查询：用户问"本月有哪些支出"、"查一下餐饮消费"等，你调用 query_flows 查询
3. 对话式统计：用户问"本月花了多少"、"收入统计"等，你调用 get_statistics 获取数据

请根据用户意图选择合适的工具，用自然语言总结结果回复用户。若无法理解或缺少关键信息，礼貌地询问用户。`;

export interface ChatAgentOptions {
  userId: number;
  messages: ChatCompletionMessageParam[];
  maxToolRounds?: number;
  /** 指定使用的 AI 服务商 ID，不传则用第一个可用 */
  providerId?: string | null;
}

export interface ChatAgentResult {
  content: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
}

/**
 * AI 对话代理：解析用户意图并调用工具执行
 */
export async function runChatAgent(
  opts: ChatAgentOptions,
): Promise<ChatAgentResult> {
  const { userId, messages, maxToolRounds = 3, providerId } = opts;
  const client = await getAIClient(providerId);
  const config = await getAIProviderConfig(providerId);

  if (!client || !config) {
    return {
      content: "未配置 AI 服务，无法对话。请在系统设置中配置 AI 服务商（如 OpenAI、DeepSeek）的 API Key。",
    };
  }

  const fullMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  let round = 0;
  let lastContent = "";

  while (round < maxToolRounds) {
    const response = await client.chat.completions.create({
      model: config.model,
      temperature: config.temperature ?? 0.5,
      max_tokens: config.maxTokens ?? 3000,
      messages: fullMessages,
      tools: CHAT_TOOLS,
      tool_choice: "auto",
    });

    const msg = response.choices[0]?.message;
    if (!msg) {
      return { content: "AI 未返回有效响应" };
    }

    fullMessages.push(msg);

    const toolCalls = msg.tool_calls;
    if (!toolCalls?.length) {
      lastContent = msg.content || "操作已完成。";
      break;
    }

    for (const tc of toolCalls) {
      const name = tc.function?.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function?.arguments || "{}");
      } catch {
        args = {};
      }
      const output = await executeTool(name!, args, { userId });
      fullMessages.push({
        role: "tool",
        tool_call_id: tc.id!,
        content: output,
      });
    }

    round++;
  }

  // 若有工具调用，再请求一次让模型基于结果生成自然语言回复
  if (fullMessages.some((m) => m.role === "tool")) {
    const finalResponse = await client.chat.completions.create({
      model: config.model,
      temperature: config.temperature ?? 0.5,
      max_tokens: config.maxTokens ?? 3000,
      messages: fullMessages,
    });
    const finalMsg = finalResponse.choices[0]?.message;
    lastContent = finalMsg?.content || lastContent || "操作已完成。";
  }

  return { content: lastContent };
}
