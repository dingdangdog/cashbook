import { getAIClient, getAIProviderConfig } from "./client";

/** 解析后的单条流水（不含 id、flowNo、userId，由导入时填充） */
export interface ParsedFlowRow {
  day: string;
  flowType: "收入" | "支出" | "不计收支";
  industryType: string;
  payType: string;
  money: number;
  name: string;
  description?: string;
  attribution?: string;
}

const PARSE_SYSTEM = `你是一个账单数据解析助手。用户的账单数据可能来自支付宝、微信、银行等渠道，列名不固定。
请根据每一行的内容，将原始数据解析为统一的流水格式，并正确分类。

输出 JSON 数组，每项包含：
- day: 日期，格式 YYYY-MM-DD
- flowType: 必为 "收入" | "支出" | "不计收支"
- industryType: 行业/分类（如：餐饮、交通、工资、理财等），根据交易描述智能推断
- payType: 支付/收款方式（如：微信、支付宝、银行卡、现金等）
- money: 金额（正数为收入，负数为支出；若原始为正数表示支出则转为负数）
- name: 条目名称/摘要
- description: 备注（可选）
- attribution: 流水归属（可选）

规则：
1. 根据交易描述判断 flowType：收入类（工资、转账入、理财收益等）、支出类（消费、转账出等）、不计收支（内部转账、退款等）
2. industryType 使用常见中文分类
3. payType 根据渠道推断，没有则填"未知"
4. 金额统一：收入为正，支出为负`;

/**
 * 使用 AI 解析账单原始行为本系统 Flow 结构
 * @param rawRows 原始行数据，每行为键值对，键为列名
 * @returns 解析后的流水数组
 */
export async function parseBillDataWithAI(
  rawRows: Record<string, unknown>[],
): Promise<{ flows: ParsedFlowRow[]; errors?: string[] }> {
  if (!rawRows.length) {
    return { flows: [] };
  }

  const client = await getAIClient();
  const config = await getAIProviderConfig();
  if (!client || !config) {
    return {
      flows: [],
      errors: ["未配置 AI 服务，无法执行解析。请在系统设置中配置 AI 服务商。"],
    };
  }

  const sample = rawRows.slice(0, 50);
  const jsonStr = JSON.stringify(sample, null, 0);

  const completion = await client.chat.completions.create({
    model: config.model,
    temperature: 0.2,
    max_tokens: config.maxTokens ?? 8000,
    messages: [
      { role: "system", content: PARSE_SYSTEM },
      {
        role: "user",
        content: `请解析以下账单数据为统一流水格式，直接返回 JSON 数组，不要其他文字：\n\n${jsonStr}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return { flows: [], errors: ["AI 未返回有效结果"] };
  }

  try {
    const parsed = JSON.parse(content);
    let arr = Array.isArray(parsed) ? parsed : parsed.flows ?? parsed.data ?? [];
    if (!Array.isArray(arr) && typeof parsed === "object") {
      const key = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      arr = key ? parsed[key] : [];
    }
    const flows: ParsedFlowRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < arr.length; i++) {
      const row = arr[i];
      const day = normalizeDate(row?.day ?? row?.日期);
      const flowType = normalizeFlowType(row?.flowType ?? row?.交易类型);
      const money = normalizeMoney(row?.money ?? row?.金额 ?? row?.amount);
      if (!day || !flowType || money == null || Number.isNaN(money)) {
        errors.push(`第 ${i + 1} 行解析不完整，已跳过`);
        continue;
      }
      flows.push({
        day,
        flowType,
        industryType: String(row?.industryType ?? row?.分类 ?? "").trim() || "其他",
        payType: String(row?.payType ?? row?.支付方式 ?? "").trim() || "未知",
        money: Number(money),
        name: String(row?.name ?? row?.摘要 ?? row?.描述 ?? "").trim() || "未命名",
        description: row?.description ? String(row.description) : undefined,
        attribution: row?.attribution ? String(row.attribution) : undefined,
      });
    }

    return { flows, errors: errors.length ? errors : undefined };
  } catch (e) {
    return {
      flows: [],
      errors: [`解析 AI 输出失败: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}

function normalizeDate(v: unknown): string {
  if (!v) return "";
  const s = String(v).trim();
  const m = s.match(/(\d{4})[-/]?(\d{1,2})[-/]?(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return s;
}

function normalizeFlowType(v: unknown): "收入" | "支出" | "不计收支" {
  const s = String(v ?? "").toLowerCase();
  if (["收入", "in", "income", "收款"].some((x) => s.includes(x))) return "收入";
  if (["不计收支", "内部", "转账", "neutral"].some((x) => s.includes(x))) return "不计收支";
  return "支出";
}

function normalizeMoney(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? null : n;
}
