import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { createFlow, getFlowsPage } from "~~/server/utils/db";
import type { FlowQueryWhere } from "~~/server/utils/db";
import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";

function genFlowNo(): string {
  return `F${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** 对话工具定义（OpenAI Function Calling 格式） */
export const CHAT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "add_flow",
      description: "添加一条流水记录。当用户表达记账、记一笔、花了多少钱、收入多少等意图时使用。",
      parameters: {
        type: "object",
        properties: {
          flowType: {
            type: "string",
            enum: ["收入", "支出", "不计收支"],
            description: "流水类型",
          },
          industryType: { type: "string", description: "行业/分类，如餐饮、交通、工资" },
          payType: { type: "string", description: "支付/收款方式，如微信、支付宝" },
          money: { type: "number", description: "金额，支出为正数传入，内部会按类型处理" },
          name: { type: "string", description: "条目名称/摘要" },
          day: { type: "string", description: "日期 YYYY-MM-DD，不传则今天" },
          description: { type: "string", description: "备注" },
          attribution: { type: "string", description: "流水归属" },
        },
        required: ["flowType", "industryType", "payType", "money", "name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_flows",
      description: "查询流水记录。当用户要查账、查流水、查某笔支出/收入、按条件筛选时使用。",
      parameters: {
        type: "object",
        properties: {
          flowType: { type: "string", enum: ["收入", "支出", "不计收支"], description: "流水类型" },
          industryType: { type: "string", description: "行业分类筛选" },
          payType: { type: "string", description: "支付方式筛选" },
          startDay: { type: "string", description: "开始日期 YYYY-MM-DD" },
          endDay: { type: "string", description: "结束日期 YYYY-MM-DD" },
          name: { type: "string", description: "名称模糊搜索" },
          pageNum: { type: "number", description: "页码，默认1" },
          pageSize: { type: "number", description: "每页条数，默认15" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_statistics",
      description: "获取统计数据。当用户问本月花了多少、收入多少、支出统计、分类汇总等时使用。",
      parameters: {
        type: "object",
        properties: {
          startDay: { type: "string", description: "开始日期 YYYY-MM-DD" },
          endDay: { type: "string", description: "结束日期 YYYY-MM-DD" },
          month: { type: "string", description: "月份 YYYY-MM，与 startDay/endDay 二选一" },
        },
      },
    },
  },
];

export interface ToolExecutionContext {
  userId: number;
}

/** 执行 add_flow 工具 */
export async function execAddFlow(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  const flowType = String(args.flowType ?? "支出");
  const industryType = String(args.industryType ?? "其他");
  const payType = String(args.payType ?? "未知");
  const money = Number(args.money ?? 0);
  const name = String(args.name ?? "");
  const day = args.day ? new Date(String(args.day)) : new Date();
  const description = args.description ? String(args.description) : null;
  const attribution = args.attribution ? String(args.attribution) : null;

  if (!name || Number.isNaN(money)) {
    return JSON.stringify({ success: false, message: "名称和金额不能为空" });
  }

  const data: Prisma.FlowCreateInput = {
    flowNo: genFlowNo(),
    userId: ctx.userId,
    day,
    flowType,
    industryType,
    payType,
    money: flowType === "支出" ? -Math.abs(money) : Math.abs(money),
    name,
    description,
    attribution,
    origin: "AI对话记账",
  };

  const created = await createFlow(data);
  return JSON.stringify({
    success: true,
    message: "记账成功",
    flow: {
      id: created.id,
      flowNo: created.flowNo,
      day: created.day,
      flowType: created.flowType,
      industryType: created.industryType,
      payType: created.payType,
      money: created.money,
      name: created.name,
    },
  });
}

/** 执行 query_flows 工具 */
export async function execQueryFlows(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  const whereInput: FlowQueryWhere = { userId: ctx.userId };
  if (args.flowType) whereInput.flowType = String(args.flowType);
  if (args.industryType) whereInput.industryType = String(args.industryType);
  if (args.payType) whereInput.payType = String(args.payType);
  if (args.name) whereInput.name = String(args.name);
  if (args.startDay) whereInput.startDay = String(args.startDay);
  if (args.endDay) whereInput.endDay = String(args.endDay);

  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(args.pageSize) || 15));

  const result = await getFlowsPage(whereInput, { pageNum, pageSize });

  return JSON.stringify({
    total: result.total,
    pageNum: result.pageNum,
    pageSize: result.pageSize,
    data: result.data.map((f) => ({
      id: f.id,
      day: f.day,
      flowType: f.flowType,
      industryType: f.industryType,
      payType: f.payType,
      money: f.money,
      name: f.name,
      description: f.description,
    })),
  });
}

/** 执行 get_statistics 工具 */
export async function execGetStatistics(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  let start: Date;
  let end: Date;
  const month = args.month ? String(args.month) : null;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    start = new Date(`${month}-01`);
    const next = new Date(start);
    next.setMonth(next.getMonth() + 1);
    end = new Date(next.getTime() - 1);
  } else if (args.startDay && args.endDay) {
    start = new Date(String(args.startDay));
    end = new Date(String(args.endDay));
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date();
  }

  const where: Prisma.FlowWhereInput = {
    userId: ctx.userId,
    day: { gte: start, lte: end },
  };

  const [sumByType, byIndustry] = await Promise.all([
    prisma.flow.groupBy({
      by: ["flowType"],
      where,
      _sum: { money: true },
      _count: true,
    }),
    prisma.flow.groupBy({
      by: ["flowType", "industryType"],
      where,
      _sum: { money: true },
    }),
  ]);

  const stats: Record<string, number> = {};
  sumByType.forEach((r) => {
    stats[r.flowType || "未知"] = r._sum.money ?? 0;
  });

  const byCategory: Record<string, Record<string, number>> = {};
  byIndustry.forEach((r) => {
    const ft = r.flowType || "未知";
    if (!byCategory[ft]) byCategory[ft] = {};
    byCategory[ft][r.industryType || "其他"] = r._sum.money ?? 0;
  });

  return JSON.stringify({
    period: { start, end },
    summary: stats,
    byCategory,
  });
}

/** 根据工具名和参数执行对应工具 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  switch (name) {
    case "add_flow":
      return execAddFlow(args, ctx);
    case "query_flows":
      return execQueryFlows(args, ctx);
    case "get_statistics":
      return execGetStatistics(args, ctx);
    default:
      return JSON.stringify({ success: false, message: `未知工具: ${name}` });
  }
}
