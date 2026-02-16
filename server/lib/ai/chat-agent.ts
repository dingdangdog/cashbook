import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getAIClient } from "./client";
import { getAIProviderConfig } from "./client";
import { CHAT_TOOLS, executeTool } from "./tools";

const SYSTEM_PROMPT = `你是个人记账助手的 AI，帮助用户完成：
1. 对话式记账：用户说"今天午饭花了50"、"记一笔工资收入5000"等，你调用 add_flow 添加流水
2. 对话式查询：用户问"本月有哪些支出"、"查一下餐饮消费"等，你调用 query_flows 查询
3. 对话式统计：用户问"本月花了多少"、"收入统计"等，你调用 get_statistics 获取数据
4. 资金账户管理：
   - 新增单个账户：调用 add_fund_account
   - 一次新增多个账户（如 微信、支付宝、若干银行卡/信用卡）：调用 batch_add_fund_accounts
   - 查询账户与余额：调用 query_fund_accounts
   - 手工校准账户余额：调用 update_fund_account_balance
5. 预算管理：
   - 设置预算：调用 set_budget
   - 查询预算：调用 query_budgets
6. 负债管理：
   - 新增负债：调用 add_liability
   - 查询负债：调用 query_liabilities
7. 应收管理：
   - 新增应收：调用 add_receivable
   - 查询应收：调用 query_receivables
8. 投资管理：
   - 新增投资产品：调用 add_investment_product
   - 查询投资产品：调用 query_investment_products
   - 新增投资明细：调用 add_investment_detail
   - 查询投资明细：调用 query_investment_details
9. 固定流水模板：
   - 新增固定流水：调用 add_fixed_flow
   - 查询固定流水：调用 query_fixed_flows

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
  strategy?: "tool_calls" | "json";
}

const TOOL_CALLS_UNSUPPORTED_PROVIDERS = new Set<string>();

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
      content:
        "未配置 AI 服务，无法对话。请在系统设置中配置 AI 服务商（如 OpenAI、DeepSeek）的 API Key。",
    };
  }

  const providerCacheKey = getProviderCacheKey(providerId);
  const skipToolCalls = TOOL_CALLS_UNSUPPORTED_PROVIDERS.has(providerCacheKey);
  const latestUserText = getLatestUserText(messages);
  logAIExecution({
    event: "start",
    userId,
    strategy: skipToolCalls ? "json" : "tool_calls",
    userText: latestUserText,
    detail: { maxToolRounds, providerId: providerId ?? null },
  });

  let toolCallsError: unknown = null;
  if (!skipToolCalls) {
    try {
      const result = await runWithToolCalls({
        userId,
        messages,
        maxToolRounds,
        client,
        config,
      });
      if (result.content.trim()) {
        logAIExecution({
          event: "final_success",
          userId,
          strategy: "tool_calls",
          userText: latestUserText,
          toolCalls: result.toolCalls,
        });
        return result;
      }
      toolCallsError = new Error("tool_calls 方案返回空内容");
    } catch (e) {
      toolCallsError = e;
      if (isToolCallsUnsupportedError(e)) {
        TOOL_CALLS_UNSUPPORTED_PROVIDERS.add(providerCacheKey);
      } else {
        logAIExecution({
          event: "strategy_failed",
          userId,
          strategy: "tool_calls",
          userText: latestUserText,
          detail: { error: errorToMessage(e) },
        });
      }
    }
  }

  try {
    const result = await runWithJsonPlan({
      userId,
      messages,
      client,
      config,
    });
    logAIExecution({
      event: "final_success",
      userId,
      strategy: "json",
      userText: latestUserText,
      toolCalls: result.toolCalls,
    });
    return result;
  } catch (jsonError) {
    const msg1 = errorToMessage(toolCallsError);
    const msg2 = errorToMessage(jsonError);
    logAIExecution({
      event: "all_failed",
      userId,
      strategy: "json",
      userText: latestUserText,
      detail: { toolCallsError: msg1, jsonError: msg2 },
    });
    throw new Error(`方案1(tool_calls)失败：${msg1}；方案2(json)失败：${msg2}`);
  }
}

async function runWithToolCalls(opts: {
  userId: number;
  messages: ChatCompletionMessageParam[];
  maxToolRounds: number;
  client: NonNullable<Awaited<ReturnType<typeof getAIClient>>>;
  config: NonNullable<Awaited<ReturnType<typeof getAIProviderConfig>>>;
}): Promise<ChatAgentResult> {
  const { userId, messages, maxToolRounds, client, config } = opts;
  const now = new Date();
  const latestUserText = getLatestUserText(messages);
  const fullMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildTimeAwareSystemPrompt(now) },
    ...messages,
  ];
  const executedToolCalls: Array<{
    name: string;
    args: Record<string, unknown>;
  }> = [];

  let round = 0;
  let lastContent = "";

  while (round < maxToolRounds) {
    const response = await client.chat.completions.create({
      model: config.model,
      temperature: config.temperature ?? 0.5,
      max_tokens: config.maxTokens ?? 3000,
      messages: fullMessages,
      tools: CHAT_TOOLS,
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
      if (tc.type !== "function") {
        continue;
      }
      const name = tc.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}");
      } catch {
        args = {};
      }
      const normalizedArgs = applyTemporalHints(
        name,
        args,
        latestUserText,
        now,
      );
      executedToolCalls.push({ name, args: normalizedArgs });
      const output = await executeTool(name, normalizedArgs, { userId });
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

  return {
    content: lastContent,
    strategy: "tool_calls",
    toolCalls: executedToolCalls,
  };
}

const JSON_PLAN_SYSTEM_PROMPT = `你是个人记账助手，请把用户诉求解析为 JSON 指令。
只输出 JSON，不要输出 markdown，不要输出额外解释。

JSON 格式固定如下：
{
  "action": {
    "name": "add_flow" | "query_flows" | "get_statistics" | "add_fund_account" | "batch_add_fund_accounts" | "query_fund_accounts" | "update_fund_account_balance" | "set_budget" | "query_budgets" | "add_liability" | "query_liabilities" | "add_receivable" | "query_receivables" | "add_investment_product" | "query_investment_products" | "add_investment_detail" | "query_investment_details" | "add_fixed_flow" | "query_fixed_flows" | "none",
    "args": { ... }
  },
  "reply": "给用户的自然语言回复（当 name=none 时必须有）"
}

参数约束：
- add_flow.args: { flowType, industryType, payType, money, name, day?, description?, attribution? }
- query_flows.args: { flowType?, industryType?, payType?, startDay?, endDay?, name?, pageNum?, pageSize? }
- get_statistics.args: { month? 或 startDay+endDay }
- add_fund_account.args: { name, accountType?, institution?, accountNo?, initialBalance?, currentBalance?, status?, description? }
- batch_add_fund_accounts.args: { accountNames: string[], defaultCurrency? }
- query_fund_accounts.args: { keyword?, status?, accountType?, pageNum?, pageSize? }
- update_fund_account_balance.args: { id? 或 name?, currentBalance, totalLiability?, totalProfit?, description? }
- set_budget.args: { month, budget, used? }
- query_budgets.args: { month?, pageNum?, pageSize? }
- add_liability.args: { name, money, occurDay?, description?, planType?, interestRate?, termCount?, termAmount?, status? }
- query_liabilities.args: { keyword?, status?, startDay?, endDay?, pageNum?, pageSize? }
- add_receivable.args: { name, money, occurDay?, description?, planType?, interestRate?, termCount?, termAmount?, status? }
- query_receivables.args: { keyword?, status?, startDay?, endDay?, pageNum?, pageSize? }
- add_investment_product.args: { productName, productType?, totalInvested?, totalReturn?, currentValue?, status? }
- query_investment_products.args: { keyword?, productType?, status?, pageNum?, pageSize? }
- add_investment_detail.args: { productId, tradeType, tradeDay?, amount, quantity?, price?, fee?, description? }
- query_investment_details.args: { productId?, tradeType?, startDay?, endDay?, pageNum?, pageSize? }
- add_fixed_flow.args: { month?, money?, name, description?, flowType?, industryType?, payType?, attribution? }
- query_fixed_flows.args: { month?, flowType?, industryType?, payType?, keyword?, pageNum?, pageSize? }

要求：
- 能调用工具就优先给 action，不要 name=none
- 数字字段必须是 number
- 日期格式 YYYY-MM-DD，月份 YYYY-MM`;

type JsonPlan = {
  action?: {
    name?: string;
    args?: Record<string, unknown>;
  };
  reply?: string;
};

const JSON_SUPPORTED_ACTIONS = new Set([
  "add_flow",
  "query_flows",
  "get_statistics",
  "add_fund_account",
  "batch_add_fund_accounts",
  "query_fund_accounts",
  "update_fund_account_balance",
  "set_budget",
  "query_budgets",
  "add_liability",
  "query_liabilities",
  "add_receivable",
  "query_receivables",
  "add_investment_product",
  "query_investment_products",
  "add_investment_detail",
  "query_investment_details",
  "add_fixed_flow",
  "query_fixed_flows",
]);

async function runWithJsonPlan(opts: {
  userId: number;
  messages: ChatCompletionMessageParam[];
  client: NonNullable<Awaited<ReturnType<typeof getAIClient>>>;
  config: NonNullable<Awaited<ReturnType<typeof getAIProviderConfig>>>;
}): Promise<ChatAgentResult> {
  const { userId, messages, client, config } = opts;
  const now = new Date();
  const latestUserText = getLatestUserText(messages);
  if (!latestUserText) {
    throw new Error("json 方案未找到用户输入");
  }

  // 兼容部分严格校验角色交替的后端：仅发送单条 user 消息做 JSON 抽取
  const fullMessages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `${JSON_PLAN_SYSTEM_PROMPT}\n\n当前服务器时间：${getNowContext(now)}\n请基于以下用户请求返回 JSON：\n${latestUserText}`,
    },
  ];

  const planResponse = await client.chat.completions.create({
    model: config.model,
    temperature: 0.1,
    max_tokens: config.maxTokens ?? 3000,
    messages: fullMessages,
  });
  const raw = planResponse.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("json 方案未返回内容");
  }

  const parsed = parseJsonPlan(raw);
  const actionName = parsed.action?.name;
  const args = parsed.action?.args ?? {};
  if (actionName && JSON_SUPPORTED_ACTIONS.has(actionName)) {
    const normalizedArgs = applyTemporalHints(
      actionName,
      args,
      latestUserText,
      now,
    );
    const toolOutput = await executeTool(actionName, normalizedArgs, {
      userId,
    });
    const finalText = await summarizeToolResult({
      client,
      config,
      userMessages: messages,
      toolName: actionName,
      toolOutput,
      hintReply: parsed.reply,
    });
    return {
      content: finalText,
      toolCalls: [{ name: actionName, args: normalizedArgs }],
      strategy: "json",
    };
  }

  const reply = parsed.reply?.trim();
  if (!reply) {
    throw new Error("json 方案缺少可用 reply");
  }
  return { content: reply, strategy: "json" };
}

function parseJsonPlan(raw: string): JsonPlan {
  try {
    return JSON.parse(raw) as JsonPlan;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("json 方案返回非 JSON 内容");
    }
    return JSON.parse(match[0]) as JsonPlan;
  }
}

async function summarizeToolResult(opts: {
  client: NonNullable<Awaited<ReturnType<typeof getAIClient>>>;
  config: NonNullable<Awaited<ReturnType<typeof getAIProviderConfig>>>;
  userMessages: ChatCompletionMessageParam[];
  toolName: string;
  toolOutput: string;
  hintReply?: string;
}): Promise<string> {
  const { client, config, userMessages, toolName, toolOutput, hintReply } =
    opts;
  const lastUser = getLatestUserText(userMessages);

  try {
    const res = await client.chat.completions.create({
      model: config.model,
      temperature: 0.2,
      max_tokens: config.maxTokens ?? 1000,
      messages: [
        {
          role: "system",
          content:
            "你是记账助手，请基于工具执行结果，给用户生成简洁中文回复。不要编造，严格基于结果。",
        },
        {
          role: "user",
          content: `用户原话：${lastUser}\n工具：${toolName}\n工具结果JSON：${toolOutput}\n参考回复：${hintReply || ""}`,
        },
      ],
    });
    const content = res.choices[0]?.message?.content?.trim();
    if (content) return content;
  } catch {
    // 忽略并走降级文本
  }

  try {
    const parsed = JSON.parse(toolOutput) as {
      success?: boolean;
      message?: string;
      total?: number;
      summary?: Record<string, number>;
      flow?: { name?: string; money?: number };
      account?: { name?: string; currentBalance?: number };
      created?: Array<{ name?: string }>;
      skipped?: string[];
    };
    if (toolName === "add_flow" && parsed.success) {
      return `已记账：${parsed.flow?.name || "未命名"} ${Math.abs(Number(parsed.flow?.money ?? 0))} 元。`;
    }
    if (toolName === "query_flows") {
      return `查询完成，共 ${parsed.total ?? 0} 条。`;
    }
    if (toolName === "get_statistics") {
      return `统计完成：${JSON.stringify(parsed.summary ?? {})}`;
    }
    if (toolName === "query_fund_accounts") {
      return `账户查询完成，共 ${parsed.total ?? 0} 个。`;
    }
    if (toolName === "add_fund_account" && parsed.success) {
      return `资金账户已处理：${parsed.account?.name || "未命名账户"}。`;
    }
    if (toolName === "batch_add_fund_accounts" && parsed.success) {
      return `资金账户批量处理完成：新增 ${parsed.created?.length ?? 0} 个，跳过 ${parsed.skipped?.length ?? 0} 个。`;
    }
    if (toolName === "update_fund_account_balance" && parsed.success) {
      return `账户余额更新成功：${parsed.account?.name || "账户"} 当前余额 ${Number(parsed.account?.currentBalance ?? 0)}。`;
    }
    return parsed.message || "操作已完成。";
  } catch {
    return "操作已完成。";
  }
}

function getLatestUserText(messages: ChatCompletionMessageParam[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m) continue;
    if (m.role !== "user") continue;
    if (typeof m.content === "string") return m.content.trim();
    if (Array.isArray(m.content)) {
      const t = m.content.find((x) => x.type === "text" && "text" in x);
      if (t && typeof t.text === "string") return t.text.trim();
    }
  }
  return "";
}

function errorToMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return String(e ?? "未知错误");
}

function getProviderCacheKey(providerId?: string | null): string {
  return providerId ? `id:${providerId}` : "__default__";
}

function isToolCallsUnsupportedError(e: unknown): boolean {
  const msg = errorToMessage(e);
  return (
    msg.includes('auto" tool choice requires') ||
    msg.includes("--enable-auto-tool-choice") ||
    msg.includes("--tool-call-parser")
  );
}

function buildTimeAwareSystemPrompt(now: Date): string {
  return `${SYSTEM_PROMPT}

当前服务器时间：${getNowContext(now)}
处理日期规则：
- 用户说“今天/昨日/昨天/本月/上月/今年”时，请按当前服务器时间换算，不要猜测年份。`;
}

function getNowContext(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function applyTemporalHints(
  toolName: string,
  args: Record<string, unknown>,
  latestUserText: string,
  now: Date,
): Record<string, unknown> {
  const text = latestUserText.trim();
  if (!text) return args;
  const next = { ...args };

  if (toolName === "add_flow") {
    if (/(今天|今日)/.test(text)) next.day = formatDate(now);
    if (/(昨天|昨日)/.test(text)) next.day = formatDate(addDays(now, -1));
  }

  if (toolName === "query_flows" || toolName === "get_statistics") {
    if (/(今天|今日)/.test(text)) {
      const day = formatDate(now);
      next.startDay = day;
      next.endDay = day;
      delete next.month;
    } else if (/(昨天|昨日)/.test(text)) {
      const day = formatDate(addDays(now, -1));
      next.startDay = day;
      next.endDay = day;
      delete next.month;
    } else if (/本月/.test(text)) {
      next.month = formatMonth(now);
      delete next.startDay;
      delete next.endDay;
    } else if (/上月/.test(text)) {
      next.month = formatMonth(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
      );
      delete next.startDay;
      delete next.endDay;
    }
  }
  return next;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

function logAIExecution(input: {
  event:
    | "start"
    | "tool_execute"
    | "strategy_failed"
    | "final_success"
    | "all_failed";
  userId: number;
  strategy: "tool_calls" | "json";
  userText?: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  detail?: Record<string, unknown>;
}): void {
  const payload = {
    ts: new Date().toISOString(),
    ...input,
  };
  console.info(`[AI_CHAT_EXEC] ${safeJson(payload)}`);
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
