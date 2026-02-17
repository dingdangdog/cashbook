import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";
import {
  normalizeFlowTypeLabel,
  recalcFundAccountFromFlows,
  resolveFlowAccountDelta,
} from "./flow-account-balance";
import {
  getFundAccountById,
  getFundAccountByName,
  getOrCreateCashFundAccount,
  resolveFundAccountByPayType,
} from "./fund-account";

type Flow = Prisma.FlowGetPayload<Record<string, never>>;

/** Flow 查询条件 */
export interface FlowQueryWhere {
  id?: number;
  userId?: number;
  accountId?: number;
  flowNo?: string;
  flowType?: string;
  industryType?: string;
  payType?: string;
  startDay?: Date | string;
  endDay?: Date | string;
  name?: string;
  description?: string;
  attribution?: string;
  eliminate?: number;
  minMoney?: number;
  maxMoney?: number;
}

function buildFlowWhere(input: FlowQueryWhere = {}): Prisma.FlowWhereInput {
  const where: Prisma.FlowWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.accountId != null) where.accountId = input.accountId;
  if (input.flowNo) where.flowNo = input.flowNo;
  if (input.flowType) where.flowType = input.flowType;
  if (input.industryType) where.industryType = input.industryType;
  if (input.payType) where.payType = input.payType;
  if (input.eliminate != null) where.eliminate = input.eliminate;
  if (input.name) where.name = { contains: input.name, mode: "insensitive" };
  if (input.description)
    where.description = { contains: input.description, mode: "insensitive" };
  if (input.attribution)
    where.attribution = { contains: input.attribution, mode: "insensitive" };
  if (input.startDay || input.endDay) {
    where.day = {};
    if (input.startDay)
      where.day.gte =
        input.startDay instanceof Date
          ? input.startDay
          : parseDateBoundary(input.startDay, "start");
    if (input.endDay)
      where.day.lte =
        input.endDay instanceof Date
          ? input.endDay
          : parseDateBoundary(input.endDay, "end");
  }
  if (input.minMoney != null || input.maxMoney != null) {
    where.money = {};
    if (input.minMoney != null) where.money.gte = input.minMoney;
    if (input.maxMoney != null) where.money.lte = input.maxMoney;
  }
  return where;
}

function parseDateBoundary(value: string, boundary: "start" | "end"): Date {
  // 仅日期字符串（YYYY-MM-DD）按本地时区扩展为整天边界，避免遗漏当天数据
  const pureDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (pureDate) {
    const y = Number(pureDate[1]);
    const m = Number(pureDate[2]) - 1;
    const d = Number(pureDate[3]);
    if (boundary === "start") {
      return new Date(y, m, d, 0, 0, 0, 0);
    }
    return new Date(y, m, d, 23, 59, 59, 999);
  }
  return new Date(value);
}

/** 根据 ID 查询单条 */
export async function getFlowById(id: number): Promise<Flow | null> {
  return prisma.flow.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getFlowsPage(
  whereInput: FlowQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.FlowOrderByWithRelationInput[] = [
    { day: "desc" },
    { id: "desc" },
  ],
): Promise<PaginationResult<Flow>> {
  const where = buildFlowWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.flow.findMany({ where, orderBy: orderBy, skip, take }),
    prisma.flow.count({ where }),
  ]);

  return {
    total,
    data,
    pages: calcTotalPages(total, pageSize),
    pageNum,
    pageSize,
  };
}

/** 创建 */
export async function createFlow(data: Prisma.FlowCreateInput): Promise<Flow> {
  const normalizedType =
    typeof data.flowType === "string"
      ? normalizeFlowTypeLabel(data.flowType)
      : null;
  let created = await prisma.flow.create({
    data: {
      ...data,
      flowType:
        normalizedType ??
        (typeof data.flowType === "string" ? data.flowType : data.flowType),
    },
  });
  if (created.accountId != null) {
    const nextDelta = resolveFlowAccountDelta({
      flowType: created.flowType,
      money: created.money,
      accountDelta: created.accountDelta,
    });
    created = await prisma.flow.update({
      where: { id: created.id },
      data: {
        accountDelta: nextDelta,
        accountBal: null,
      },
    });
  }
  await recalcFundAccountFromFlows(created.accountId ?? undefined);
  return created;
}

/** 更新 */
export async function updateFlow(
  id: number,
  data: Prisma.FlowUpdateInput,
): Promise<Flow> {
  return prisma.$transaction(async (tx) => {
    const oldRow = await tx.flow.findUnique({ where: { id } });
    let updated = await tx.flow.update({ where: { id }, data });

    if (updated.accountId != null) {
      const nextDelta = resolveFlowAccountDelta({
        flowType: updated.flowType,
        money: updated.money,
        accountDelta: updated.accountDelta,
      });
      updated = await tx.flow.update({
        where: { id },
        data: {
          accountDelta: nextDelta,
          accountBal: null,
        },
      });
    } else if (updated.accountDelta != null || updated.accountBal != null) {
      updated = await tx.flow.update({
        where: { id },
        data: {
          accountDelta: null,
          accountBal: null,
        },
      });
    }

    const oldAccountId = oldRow?.accountId ?? undefined;
    const newAccountId = updated.accountId ?? undefined;
    await recalcFundAccountFromFlows(
      oldAccountId,
      tx as unknown as Prisma.TransactionClient,
    );
    if (newAccountId !== oldAccountId) {
      await recalcFundAccountFromFlows(
        newAccountId,
        tx as unknown as Prisma.TransactionClient,
      );
    }
    return updated;
  });
}

/** 删除 */
export async function deleteFlow(id: number): Promise<Flow> {
  const deleted = await prisma.flow.delete({ where: { id } });
  await recalcFundAccountFromFlows(deleted.accountId ?? undefined);
  return deleted;
}

function genFlowNo(): string {
  return `F${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export interface AIToolContext {
  userId: number;
}

export async function createFlowByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<{
  success: boolean;
  message: string;
  flow?: Flow;
  matchedFundAccount?: {
    id: number;
    name: string;
    accountType: string;
  } | null;
}> {
  const flowType =
    normalizeFlowTypeLabel(String(args.flowType ?? "支出")) ?? "支出";
  const industryType = String(args.industryType ?? "其他");
  const payType = String(args.payType ?? "未知");
  const money = Number(args.money ?? 0);
  const name = String(args.name ?? "");
  const day = args.day ? new Date(String(args.day)) : new Date();
  const description = args.description ? String(args.description) : null;
  const attribution = args.attribution ? String(args.attribution) : null;
  const accountIdArg =
    args.accountId !== undefined && args.accountId !== null
      ? Number(args.accountId)
      : null;
  const accountNameArg = args.accountName
    ? String(args.accountName).trim()
    : "";
  if (Number.isNaN(money)) {
    return { success: false, message: "金额不能为空" };
  }

  const normalizedMoney =
    flowType === "支出"
      ? -Math.abs(money)
      : flowType === "收入"
        ? Math.abs(money)
        : Number(money);
  let matchedAccount = null as Awaited<
    ReturnType<typeof resolveFundAccountByPayType>
  >;
  if (accountIdArg != null && Number.isFinite(accountIdArg)) {
    const accountById = await getFundAccountById(accountIdArg);
    if (
      accountById &&
      accountById.userId === ctx.userId &&
      accountById.status !== -1
    ) {
      matchedAccount = accountById;
    }
  }
  if (!matchedAccount && accountNameArg) {
    const accountByName = await getFundAccountByName(
      ctx.userId,
      accountNameArg,
    );
    if (accountByName && accountByName.status !== -1) {
      matchedAccount = accountByName;
    }
  }
  if (!matchedAccount) {
    matchedAccount = await resolveFundAccountByPayType(ctx.userId, payType);
  }
  if (!matchedAccount) {
    matchedAccount = await getOrCreateCashFundAccount(ctx.userId);
  }
  const accountId = matchedAccount.id;

  const created = await prisma.$transaction(async (tx) => {
    const delta = resolveFlowAccountDelta({
      flowType,
      money: normalizedMoney,
      accountDelta: null,
    });
    const row = await tx.flow.create({
      data: {
        flowNo: genFlowNo(),
        userId: ctx.userId,
        day,
        flowType,
        industryType,
        payType,
        money: normalizedMoney,
        name,
        description,
        attribution,
        origin: "AI对话记账",
        accountId,
        accountDelta: delta,
        accountBal: null,
      },
    });
    // 与 update 一致：流水写入后在同一事务内重算资金账户
    await recalcFundAccountFromFlows(
      accountId,
      tx as unknown as Prisma.TransactionClient,
    );
    return row;
  });

  return {
    success: true,
    message: "记账成功",
    flow: created,
    matchedFundAccount: matchedAccount
      ? {
          id: matchedAccount.id,
          name: matchedAccount.name,
          accountType: matchedAccount.accountType,
        }
      : null,
  };
}

export async function queryFlowsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<{
  total: number;
  pageNum: number;
  pageSize: number;
  data: Array<{
    id: number;
    day: Date;
    flowType: string | null;
    industryType: string | null;
    payType: string | null;
    money: number | null;
    name: string | null;
    description: string | null;
  }>;
}> {
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

  return {
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
  };
}

export async function queryFlowExtremesByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<{
  period: { start: Date; end: Date };
  filters: {
    flowType?: string;
    industryType?: string;
    payType?: string;
    name?: string;
  };
  topExpense: Array<{
    id: number;
    day: Date;
    flowType: string | null;
    industryType: string | null;
    payType: string | null;
    money: number | null;
    name: string | null;
    description: string | null;
  }>;
  topIncome: Array<{
    id: number;
    day: Date;
    flowType: string | null;
    industryType: string | null;
    payType: string | null;
    money: number | null;
    name: string | null;
    description: string | null;
  }>;
}> {
  const toMonthRange = (monthText: string): { start: Date; end: Date } | null => {
    const match = monthText.match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return null;
    if (monthIndex < 0 || monthIndex > 11) return null;
    return {
      start: new Date(year, monthIndex, 1, 0, 0, 0, 0),
      end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999),
    };
  };
  const sortByAmountAbsDesc = <T extends { money: number | null }>(rows: T[]): T[] =>
    rows
      .slice()
      .sort((a, b) => Math.abs(Number(b.money ?? 0)) - Math.abs(Number(a.money ?? 0)));

  const now = new Date();
  const month = args.month ? String(args.month) : "";
  let start: Date;
  let end: Date;
  if (month) {
    const monthRange = toMonthRange(month);
    if (monthRange) {
      start = monthRange.start;
      end = monthRange.end;
    } else {
      const startArg = args.startDay ? String(args.startDay) : "";
      const endArg = args.endDay ? String(args.endDay) : "";
      if (startArg || endArg) {
        start = startArg ? parseDateBoundary(startArg, "start") : new Date(0);
        end = endArg ? parseDateBoundary(endArg, "end") : now;
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
      }
    }
  } else {
    const startArg = args.startDay ? String(args.startDay) : "";
    const endArg = args.endDay ? String(args.endDay) : "";
    if (startArg || endArg) {
      start = startArg ? parseDateBoundary(startArg, "start") : new Date(0);
      end = endArg ? parseDateBoundary(endArg, "end") : now;
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    }
  }

  const limit = Math.min(10, Math.max(1, Number(args.limit) || 1));
  const normalizedFlowType = args.flowType
    ? normalizeFlowTypeLabel(String(args.flowType))
    : null;
  const name = args.name ? String(args.name) : undefined;
  const industryType = args.industryType ? String(args.industryType) : undefined;
  const payType = args.payType ? String(args.payType) : undefined;
  const commonWhere: Prisma.FlowWhereInput = {
    userId: ctx.userId,
    day: { gte: start, lte: end },
    ...(industryType ? { industryType } : {}),
    ...(payType ? { payType } : {}),
    ...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
  };

  const needExpense = normalizedFlowType !== "收入";
  const needIncome = normalizedFlowType !== "支出";
  const [
    expenseNegativeRows,
    expensePositiveRows,
    incomePositiveRows,
    incomeNegativeRows,
  ] = await Promise.all([
    needExpense
      ? prisma.flow.findMany({
          where: { ...commonWhere, flowType: "支出", money: { lt: 0 } },
          orderBy: [{ money: "asc" }, { day: "desc" }, { id: "desc" }],
          take: limit,
        })
      : Promise.resolve([] as Flow[]),
    needExpense
      ? prisma.flow.findMany({
          where: { ...commonWhere, flowType: "支出", money: { gt: 0 } },
          orderBy: [{ money: "desc" }, { day: "desc" }, { id: "desc" }],
          take: limit,
        })
      : Promise.resolve([] as Flow[]),
    needIncome
      ? prisma.flow.findMany({
          where: { ...commonWhere, flowType: "收入", money: { gt: 0 } },
          orderBy: [{ money: "desc" }, { day: "desc" }, { id: "desc" }],
          take: limit,
        })
      : Promise.resolve([] as Flow[]),
    needIncome
      ? prisma.flow.findMany({
          where: { ...commonWhere, flowType: "收入", money: { lt: 0 } },
          orderBy: [{ money: "asc" }, { day: "desc" }, { id: "desc" }],
          take: limit,
        })
      : Promise.resolve([] as Flow[]),
  ]);
  const topExpenseRows = needExpense
    ? sortByAmountAbsDesc([...expenseNegativeRows, ...expensePositiveRows]).slice(
        0,
        limit,
      )
    : [];
  const topIncomeRows = needIncome
    ? sortByAmountAbsDesc([...incomePositiveRows, ...incomeNegativeRows]).slice(
        0,
        limit,
      )
    : [];

  const mapRow = (f: Flow) => ({
    id: f.id,
    day: f.day,
    flowType: f.flowType,
    industryType: f.industryType,
    payType: f.payType,
    money: f.money,
    name: f.name,
    description: f.description,
  });

  return {
    period: { start, end },
    filters: {
      flowType: normalizedFlowType ?? undefined,
      industryType,
      payType,
      name,
    },
    topExpense: topExpenseRows.map(mapRow),
    topIncome: topIncomeRows.map(mapRow),
  };
}

export async function getFlowStatisticsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<{
  period: { start: Date; end: Date };
  summary: Record<string, number>;
  byCategory: Record<string, Record<string, number>>;
}> {
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

  const [sumByType, byIndustry] = (await Promise.all([
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
  ])) as [
    Array<{ flowType: string | null; _sum: { money: number | null } }>,
    Array<{
      flowType: string | null;
      industryType: string | null;
      _sum: { money: number | null };
    }>,
  ];

  const summary: Record<string, number> = {};
  sumByType.forEach((r) => {
    summary[r.flowType || "未知"] = r._sum.money ?? 0;
  });

  const byCategory: Record<string, Record<string, number>> = {};
  byIndustry.forEach((r) => {
    const ft = r.flowType || "未知";
    if (!byCategory[ft]) byCategory[ft] = {};
    byCategory[ft][r.industryType || "其他"] = r._sum.money ?? 0;
  });

  return {
    period: { start, end },
    summary,
    byCategory,
  };
}
