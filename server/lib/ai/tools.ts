import type { ChatCompletionTool } from "openai/resources/chat/completions";
import {
  createFlow,
  createFundAccount,
  createFundAccountsBatch,
  getFundAccountById,
  getFundAccountByName,
  getFundAccountsPage,
  getFlowsPage,
  normalizeFundAccountType,
  updateFundAccount,
} from "~~/server/utils/db";
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
  {
    type: "function",
    function: {
      name: "add_fund_account",
      description:
        "添加一个资金账户（银行卡、信用卡、微信、支付宝、投资账户等）。当用户说新增账户时使用。",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "账户名称，如 招商银行卡" },
          accountType: {
            type: "string",
            description: "账户类型，如 银行卡/信用卡/支付宝/微信/投资账户/现金/其他",
          },
          institution: { type: "string", description: "开户机构或平台（可选）" },
          accountNo: { type: "string", description: "账号标识（可选，建议脱敏）" },
          initialBalance: { type: "number", description: "初始余额，可选，默认0" },
          currentBalance: {
            type: "number",
            description: "当前余额，可选，不传则同 initialBalance",
          },
          status: { type: "number", description: "状态，1启用/0停用/-1归档，默认1" },
          description: { type: "string", description: "备注，可选" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "batch_add_fund_accounts",
      description:
        "批量添加资金账户。用户一次给出多个账户名称（如微信、支付宝、银行卡等）时使用。",
      parameters: {
        type: "object",
        properties: {
          accountNames: {
            type: "array",
            items: { type: "string" },
            description: "账户名称数组",
          },
          defaultCurrency: {
            type: "string",
            description: "默认币种，默认CNY",
          },
        },
        required: ["accountNames"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_fund_accounts",
      description: "查询资金账户列表。用户询问账户、余额、账户明细时使用。",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "关键字，匹配名称/机构/账号" },
          status: { type: "number", description: "状态过滤" },
          accountType: { type: "string", description: "账户类型过滤" },
          pageNum: { type: "number", description: "页码，默认1" },
          pageSize: { type: "number", description: "每页条数，默认20" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_fund_account_balance",
      description:
        "更新资金账户余额（手工校准）。用户说调整某账户余额、把某账户改成X元时使用。",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "账户ID（与 name 二选一）" },
          name: { type: "string", description: "账户名称（与 id 二选一）" },
          currentBalance: { type: "number", description: "更新后的当前余额" },
          totalLiability: {
            type: "number",
            description: "可选，同步更新负债余额",
          },
          totalProfit: { type: "number", description: "可选，同步更新累计收益" },
          description: { type: "string", description: "可选，备注" },
        },
        required: ["currentBalance"],
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

/** 执行 add_fund_account 工具 */
export async function execAddFundAccount(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  const name = String(args.name ?? "").trim();
  if (!name) {
    return JSON.stringify({ success: false, message: "账户名称不能为空" });
  }

  const existed = await getFundAccountByName(ctx.userId, name);
  if (existed) {
    return JSON.stringify({
      success: true,
      message: "账户已存在，已跳过创建",
      account: existed,
      skipped: true,
    });
  }

  const accountType = normalizeFundAccountType(String(args.accountType ?? name));
  const initialBalance = Number(args.initialBalance ?? 0);
  const currentBalance =
    args.currentBalance != null ? Number(args.currentBalance) : initialBalance;
  const status = args.status != null ? Number(args.status) : 1;

  const created = await createFundAccount({
    userId: ctx.userId,
    name,
    accountType,
    institution: args.institution ? String(args.institution) : null,
    accountNo: args.accountNo ? String(args.accountNo) : null,
    currency: "CNY",
    initialBalance,
    currentBalance,
    totalIncome: 0,
    totalExpense: 0,
    totalLiability: 0,
    totalProfit: 0,
    status,
    description: args.description ? String(args.description) : null,
  });

  return JSON.stringify({
    success: true,
    message: "账户创建成功",
    account: created,
  });
}

/** 执行 batch_add_fund_accounts 工具 */
export async function execBatchAddFundAccounts(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  const list = Array.isArray(args.accountNames) ? args.accountNames : [];
  const names = list.map((x) => String(x || "").trim()).filter(Boolean);
  if (names.length === 0) {
    return JSON.stringify({
      success: false,
      message: "accountNames 不能为空",
    });
  }

  const result = await createFundAccountsBatch({
    userId: ctx.userId,
    names,
    defaultCurrency: args.defaultCurrency
      ? String(args.defaultCurrency)
      : "CNY",
  });

  return JSON.stringify({
    success: true,
    message: `批量创建完成，成功 ${result.created.length} 个，跳过 ${result.skipped.length} 个`,
    created: result.created.map((x) => ({
      id: x.id,
      name: x.name,
      accountType: x.accountType,
      currentBalance: x.currentBalance,
    })),
    skipped: result.skipped,
  });
}

/** 执行 query_fund_accounts 工具 */
export async function execQueryFundAccounts(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(args.pageSize) || 20));

  const result = await getFundAccountsPage(
    {
      userId: ctx.userId,
      keyword: args.keyword ? String(args.keyword) : undefined,
      status:
        args.status !== undefined && args.status !== null
          ? Number(args.status)
          : undefined,
      accountType: args.accountType ? String(args.accountType) : undefined,
    },
    { pageNum, pageSize },
  );

  return JSON.stringify({
    total: result.total,
    pageNum: result.pageNum,
    pageSize: result.pageSize,
    data: result.data.map((x) => ({
      id: x.id,
      name: x.name,
      accountType: x.accountType,
      currentBalance: x.currentBalance,
      totalIncome: x.totalIncome,
      totalExpense: x.totalExpense,
      totalLiability: x.totalLiability,
      status: x.status,
    })),
  });
}

/** 执行 update_fund_account_balance 工具 */
export async function execUpdateFundAccountBalance(
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  const currentBalance = Number(args.currentBalance);
  if (!Number.isFinite(currentBalance)) {
    return JSON.stringify({
      success: false,
      message: "currentBalance 必须为数字",
    });
  }

  let account = null as Awaited<ReturnType<typeof getFundAccountById>> | null;
  if (args.id != null) {
    const id = Number(args.id);
    if (Number.isFinite(id)) {
      const found = await getFundAccountById(id);
      if (found && found.userId === ctx.userId) {
        account = found;
      }
    }
  }
  if (!account && args.name) {
    account = await getFundAccountByName(ctx.userId, String(args.name));
  }
  if (!account) {
    return JSON.stringify({
      success: false,
      message: "未找到对应资金账户",
    });
  }

  const updated = await updateFundAccount(account.id, {
    currentBalance,
    ...(args.totalLiability !== undefined &&
      args.totalLiability !== null && {
        totalLiability: Number(args.totalLiability),
      }),
    ...(args.totalProfit !== undefined &&
      args.totalProfit !== null && { totalProfit: Number(args.totalProfit) }),
    ...(args.description !== undefined && {
      description: String(args.description || ""),
    }),
  });

  return JSON.stringify({
    success: true,
    message: "账户余额更新成功",
    account: {
      id: updated.id,
      name: updated.name,
      accountType: updated.accountType,
      currentBalance: updated.currentBalance,
      totalLiability: updated.totalLiability,
      totalProfit: updated.totalProfit,
    },
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
    case "add_fund_account":
      return execAddFundAccount(args, ctx);
    case "batch_add_fund_accounts":
      return execBatchAddFundAccounts(args, ctx);
    case "query_fund_accounts":
      return execQueryFundAccounts(args, ctx);
    case "update_fund_account_balance":
      return execUpdateFundAccountBalance(args, ctx);
    default:
      return JSON.stringify({ success: false, message: `未知工具: ${name}` });
  }
}
