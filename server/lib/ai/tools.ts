import type { ChatCompletionTool } from "openai/resources/chat/completions";
import {
  addFundAccountByAI,
  addInvestmentDetailByAI,
  addInvestmentProductByAI,
  addLiabilityByAI,
  addReceivableByAI,
  addFixedFlowByAI,
  batchAddFundAccountsByAI,
  createFlowByAI,
  queryBudgetsByAI,
  getFlowStatisticsByAI,
  queryFixedFlowsByAI,
  queryInvestmentDetailsByAI,
  queryInvestmentProductsByAI,
  queryLiabilitiesByAI,
  queryFlowsByAI,
  queryFundAccountsByAI,
  queryReceivablesByAI,
  setBudgetByAI,
  updateFundAccountBalanceByAI,
} from "~~/server/utils/db";

/** 对话工具定义（OpenAI Function Calling 格式） */
export const CHAT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "add_flow",
      description:
        "添加一条流水记录。当用户表达记账、记一笔、花了多少钱、收入多少等意图时使用。",
      parameters: {
        type: "object",
        properties: {
          flowType: {
            type: "string",
            enum: ["收入", "支出", "不计收支"],
            description: "流水类型",
          },
          industryType: {
            type: "string",
            description: "行业/分类，如餐饮、交通、工资",
          },
          money: {
            type: "number",
            description: "金额，支出为正数传入，内部会按类型处理",
          },
          name: { type: "string", description: "条目名称/摘要" },
          day: { type: "string", description: "日期 YYYY-MM-DD，不传则今天" },
          description: {
            type: "string",
            description: "备注：如果没有明确说明，则无需处理",
          },
          attribution: {
            type: "string",
            description: "流水归属：如“张三购买xxx商品”，则归属为“张三”",
          },
          accountId: {
            type: "number",
            description:
              "资金账户ID。规则：1) 用户明确说了账户（如招行卡、支付宝）时，从系统提供的「当前用户资金账户列表（id+名称）」中匹配对应 id 填入；2) 无法判断具体账户时，填入该用户「现金」账户的 id，不要阻塞记账。",
          },
          accountName: {
            type: "string",
            description:
              "资金账户名称（如招商银行卡）。根据 accountId 填写对应的 name。",
          },
        },
        required: ["flowType", "industryType", "payType", "money", "name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_flows",
      description:
        "查询流水记录。当用户要查账、查流水、查某笔支出/收入、按条件筛选时使用。",
      parameters: {
        type: "object",
        properties: {
          flowType: {
            type: "string",
            enum: ["收入", "支出", "不计收支"],
            description: "流水类型",
          },
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
      description:
        "获取统计数据。当用户问本月花了多少、收入多少、支出统计、分类汇总等时使用。",
      parameters: {
        type: "object",
        properties: {
          startDay: { type: "string", description: "开始日期 YYYY-MM-DD" },
          endDay: { type: "string", description: "结束日期 YYYY-MM-DD" },
          month: {
            type: "string",
            description: "月份 YYYY-MM，与 startDay/endDay 二选一",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_fund_account",
      description:
        "添加一个资金账户（银行卡、信用卡、微信、支付宝、投资账户等）。当用户说新增资金账户时使用。",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "账户名称，如 招商银行卡" },
          accountType: {
            type: "string",
            description:
              "账户类型，如 银行卡/信用卡/支付宝/微信/投资账户/现金/其他",
          },
          institution: {
            type: "string",
            description: "开户机构或平台（可选）",
          },
          accountNo: {
            type: "string",
            description: "账号标识（可选，建议脱敏）",
          },
          initialBalance: {
            type: "number",
            description: "初始余额，可选，默认0",
          },
          currentBalance: {
            type: "number",
            description: "当前余额，可选，不传则同 initialBalance",
          },
          status: {
            type: "number",
            description: "状态，1启用/0停用/-1归档，默认1",
          },
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
          keyword: {
            type: "string",
            description: "关键字，匹配名称/机构/账号",
          },
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
          totalProfit: {
            type: "number",
            description: "可选，同步更新累计收益",
          },
          description: { type: "string", description: "可选，备注" },
        },
        required: ["currentBalance"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_budget",
      description: "设置某个月预算（存在则更新，不存在则创建）。",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "月份 YYYY-MM" },
          budget: { type: "number", description: "预算金额" },
          used: { type: "number", description: "已使用金额（可选）" },
        },
        required: ["month", "budget"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_budgets",
      description: "查询预算列表，可按月份查询。",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "月份 YYYY-MM（可选）" },
          pageNum: { type: "number", description: "页码" },
          pageSize: { type: "number", description: "每页条数" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_liability",
      description: "新增一笔负债（借款/欠款）。",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "负债名称/对象" },
          money: { type: "number", description: "负债本金" },
          occurDay: { type: "string", description: "发生日期 YYYY-MM-DD" },
          description: { type: "string", description: "备注" },
          planType: { type: "number", description: "计划类型" },
          interestRate: { type: "number", description: "年化利率" },
          termCount: { type: "number", description: "期数" },
          termAmount: { type: "number", description: "每期金额" },
          status: { type: "number", description: "状态" },
        },
        required: ["name", "money"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_liabilities",
      description: "查询负债列表。",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "关键字" },
          status: { type: "number", description: "状态" },
          startDay: { type: "string", description: "开始日期 YYYY-MM-DD" },
          endDay: { type: "string", description: "结束日期 YYYY-MM-DD" },
          pageNum: { type: "number", description: "页码" },
          pageSize: { type: "number", description: "每页条数" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_receivable",
      description: "新增一笔应收（借给他人）。",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "应收名称/对象" },
          money: { type: "number", description: "应收本金" },
          occurDay: { type: "string", description: "发生日期 YYYY-MM-DD" },
          description: { type: "string", description: "备注" },
          planType: { type: "number", description: "计划类型" },
          interestRate: { type: "number", description: "年化利率" },
          termCount: { type: "number", description: "期数" },
          termAmount: { type: "number", description: "每期金额" },
          status: { type: "number", description: "状态" },
        },
        required: ["name", "money"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_receivables",
      description: "查询应收列表。",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "关键字" },
          status: { type: "number", description: "状态" },
          startDay: { type: "string", description: "开始日期 YYYY-MM-DD" },
          endDay: { type: "string", description: "结束日期 YYYY-MM-DD" },
          pageNum: { type: "number", description: "页码" },
          pageSize: { type: "number", description: "每页条数" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_investment_product",
      description: "新增投资产品。",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "产品名称" },
          productType: { type: "string", description: "产品类型" },
          totalInvested: { type: "number", description: "累计投入" },
          totalReturn: { type: "number", description: "累计收益" },
          currentValue: { type: "number", description: "当前估值" },
          status: { type: "number", description: "状态" },
        },
        required: ["productName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_investment_products",
      description: "查询投资产品列表。",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "关键字" },
          productType: { type: "string", description: "产品类型" },
          status: { type: "number", description: "状态" },
          pageNum: { type: "number", description: "页码" },
          pageSize: { type: "number", description: "每页条数" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_investment_detail",
      description: "新增投资交易明细。",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "number", description: "产品ID" },
          tradeType: { type: "string", description: "交易类型" },
          tradeDay: { type: "string", description: "交易日期 YYYY-MM-DD" },
          amount: { type: "number", description: "金额" },
          quantity: { type: "number", description: "数量/份额" },
          price: { type: "number", description: "单价" },
          fee: { type: "number", description: "手续费" },
          description: { type: "string", description: "备注" },
        },
        required: ["productId", "tradeType", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_investment_details",
      description: "查询投资交易明细。",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "number", description: "产品ID" },
          tradeType: { type: "string", description: "交易类型" },
          startDay: { type: "string", description: "开始日期 YYYY-MM-DD" },
          endDay: { type: "string", description: "结束日期 YYYY-MM-DD" },
          pageNum: { type: "number", description: "页码" },
          pageSize: { type: "number", description: "每页条数" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_fixed_flow",
      description: "新增固定流水模板（周期记账）。",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "月份 YYYY-MM（可选）" },
          money: { type: "number", description: "金额" },
          name: { type: "string", description: "名称" },
          description: { type: "string", description: "备注" },
          flowType: { type: "string", description: "流水类型" },
          industryType: { type: "string", description: "行业分类" },
          payType: { type: "string", description: "支付方式" },
          attribution: { type: "string", description: "归属" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_fixed_flows",
      description: "查询固定流水模板。",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "月份 YYYY-MM" },
          flowType: { type: "string", description: "流水类型" },
          industryType: { type: "string", description: "行业分类" },
          payType: { type: "string", description: "支付方式" },
          keyword: { type: "string", description: "关键字" },
          pageNum: { type: "number", description: "页码" },
          pageSize: { type: "number", description: "每页条数" },
        },
      },
    },
  },
];

export interface ToolExecutionContext {
  userId: number;
}

/** 根据工具名和参数执行对应工具 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
): Promise<string> {
  switch (name) {
    case "add_flow":
      return JSON.stringify(await createFlowByAI(args, ctx));
    case "query_flows":
      return JSON.stringify(await queryFlowsByAI(args, ctx));
    case "get_statistics":
      return JSON.stringify(await getFlowStatisticsByAI(args, ctx));
    case "add_fund_account":
      return JSON.stringify(await addFundAccountByAI(args, ctx));
    case "batch_add_fund_accounts":
      return JSON.stringify(await batchAddFundAccountsByAI(args, ctx));
    case "query_fund_accounts":
      return JSON.stringify(await queryFundAccountsByAI(args, ctx));
    case "update_fund_account_balance":
      return JSON.stringify(await updateFundAccountBalanceByAI(args, ctx));
    case "set_budget":
      return JSON.stringify(await setBudgetByAI(args, ctx));
    case "query_budgets":
      return JSON.stringify(await queryBudgetsByAI(args, ctx));
    case "add_liability":
      return JSON.stringify(await addLiabilityByAI(args, ctx));
    case "query_liabilities":
      return JSON.stringify(await queryLiabilitiesByAI(args, ctx));
    case "add_receivable":
      return JSON.stringify(await addReceivableByAI(args, ctx));
    case "query_receivables":
      return JSON.stringify(await queryReceivablesByAI(args, ctx));
    case "add_investment_product":
      return JSON.stringify(await addInvestmentProductByAI(args, ctx));
    case "query_investment_products":
      return JSON.stringify(await queryInvestmentProductsByAI(args, ctx));
    case "add_investment_detail":
      return JSON.stringify(await addInvestmentDetailByAI(args, ctx));
    case "query_investment_details":
      return JSON.stringify(await queryInvestmentDetailsByAI(args, ctx));
    case "add_fixed_flow":
      return JSON.stringify(await addFixedFlowByAI(args, ctx));
    case "query_fixed_flows":
      return JSON.stringify(await queryFixedFlowsByAI(args, ctx));
    default:
      return JSON.stringify({ success: false, message: `未知工具: ${name}` });
  }
}
