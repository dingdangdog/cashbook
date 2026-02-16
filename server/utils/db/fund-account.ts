import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type FundAccount = Prisma.FundAccountGetPayload<Record<string, never>>;
export interface AIToolContext {
  userId: number;
}

/** FundAccount 查询条件 */
export interface FundAccountQueryWhere {
  id?: number;
  userId?: number;
  status?: number;
  accountType?: string;
  name?: string;
  keyword?: string;
}

const KNOWN_ACCOUNT_TYPES = [
  "银行卡",
  "信用卡",
  "支付宝",
  "微信",
  "投资账户",
  "现金",
  "其他",
];

export function normalizeFundAccountType(input?: string | null): string {
  const raw = String(input || "").trim();
  if (!raw) return "其他";
  if (KNOWN_ACCOUNT_TYPES.includes(raw)) return raw;

  if (/微信/.test(raw)) return "微信";
  if (/支付宝/.test(raw)) return "支付宝";
  if (/信用卡/.test(raw)) return "信用卡";
  if (/银行卡|借记卡|储蓄卡/.test(raw)) return "银行卡";
  if (/现金/.test(raw)) return "现金";
  if (/投资|基金|股票|理财|券商|金融/.test(raw)) return "投资账户";
  return "其他";
}

function buildFundAccountWhere(
  input: FundAccountQueryWhere = {},
): Prisma.FundAccountWhereInput {
  const where: Prisma.FundAccountWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.status != null) where.status = input.status;
  if (input.accountType) where.accountType = input.accountType;
  if (input.name) where.name = input.name;
  if (input.keyword) {
    where.OR = [
      { name: { contains: input.keyword, mode: "insensitive" } },
      { institution: { contains: input.keyword, mode: "insensitive" } },
      { accountNo: { contains: input.keyword, mode: "insensitive" } },
      { description: { contains: input.keyword, mode: "insensitive" } },
    ];
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getFundAccountById(
  id: number,
): Promise<FundAccount | null> {
  return prisma.fundAccount.findUnique({ where: { id } });
}

/** 根据用户+名称查询单条 */
export async function getFundAccountByName(
  userId: number,
  name: string,
): Promise<FundAccount | null> {
  return prisma.fundAccount.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
    },
  });
}

function splitAccountKeywords(input: string): string[] {
  return Array.from(
    new Set(
      String(input || "")
        .split(/[\/、,，\s]+/)
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  );
}

function buildAccountAliases(input: string): string[] {
  const base = splitAccountKeywords(input);
  const normalized = base
    .map((x) => normalizeFundAccountType(x))
    .filter((x) => x && x !== "其他");
  return Array.from(new Set([...base, ...normalized]));
}

/**
 * 按记账支付方式智能匹配资金账户（名称优先，其次类型与模糊匹配）
 */
export async function resolveFundAccountByPayType(
  userId: number,
  payType?: string | null,
): Promise<FundAccount | null> {
  const text = String(payType || "").trim();
  if (!text) return null;

  const aliases = buildAccountAliases(text);
  if (aliases.length === 0) return null;

  const exactByName = await prisma.fundAccount.findFirst({
    where: {
      userId,
      status: { not: -1 },
      OR: aliases.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
    orderBy: [{ sortBy: "asc" }, { id: "desc" }],
  });
  if (exactByName) return exactByName;

  const exactByType = await prisma.fundAccount.findFirst({
    where: {
      userId,
      status: { not: -1 },
      OR: aliases.map((accountType) => ({ accountType })),
    },
    orderBy: [{ sortBy: "asc" }, { id: "desc" }],
  });
  if (exactByType) return exactByType;

  const fuzzy = await prisma.fundAccount.findFirst({
    where: {
      userId,
      status: { not: -1 },
      OR: aliases.flatMap((keyword) => [
        { name: { contains: keyword, mode: "insensitive" as const } },
        { institution: { contains: keyword, mode: "insensitive" as const } },
      ]),
    },
    orderBy: [{ sortBy: "asc" }, { id: "desc" }],
  });
  return fuzzy;
}

/** 分页查询 */
export async function getFundAccountsPage(
  whereInput: FundAccountQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.FundAccountOrderByWithRelationInput[] = [
    { sortBy: "asc" },
    { id: "desc" },
  ],
): Promise<PaginationResult<FundAccount>> {
  const where = buildFundAccountWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.fundAccount.findMany({ where, orderBy, skip, take }),
    prisma.fundAccount.count({ where }),
  ]);

  return {
    total,
    data,
    pages: calcTotalPages(total, pageSize),
    pageNum,
    pageSize,
  };
}

/** 查询全部 */
export async function getFundAccountsAll(
  whereInput: FundAccountQueryWhere = {},
): Promise<FundAccount[]> {
  const where = buildFundAccountWhere(whereInput);
  return prisma.fundAccount.findMany({
    where,
    orderBy: [{ sortBy: "asc" }, { id: "desc" }],
  });
}

/** 创建 */
export async function createFundAccount(
  data: Prisma.FundAccountCreateInput,
): Promise<FundAccount> {
  return prisma.fundAccount.create({ data });
}

/** 批量创建（按名称跳过已存在账户） */
export async function createFundAccountsBatch(input: {
  userId: number;
  names: string[];
  defaultCurrency?: string;
}): Promise<{ created: FundAccount[]; skipped: string[] }> {
  const userId = input.userId;
  const currency = input.defaultCurrency || "CNY";
  const normalizedNames = Array.from(
    new Set(
      input.names
        .map((v) => String(v || "").trim())
        .filter(Boolean),
    ),
  );
  if (normalizedNames.length === 0) {
    return { created: [], skipped: [] };
  }

  const existing = await prisma.fundAccount.findMany({
    where: {
      userId,
      OR: normalizedNames.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
    select: { name: true },
  });
  const existingSet = new Set(existing.map((x) => x.name.toLowerCase()));

  const toCreate = normalizedNames.filter(
    (name) => !existingSet.has(name.toLowerCase()),
  );
  const skipped = normalizedNames.filter((name) =>
    existingSet.has(name.toLowerCase()),
  );

  const created: FundAccount[] = [];
  for (const name of toCreate) {
    const accountType = normalizeFundAccountType(name);
    const row = await prisma.fundAccount.create({
      data: {
        userId,
        name,
        accountType,
        currency,
        initialBalance: 0,
        currentBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        totalLiability: 0,
        totalProfit: 0,
        status: 1,
      },
    });
    created.push(row);
  }

  return { created, skipped };
}

export async function addFundAccountByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<{
  success: boolean;
  message: string;
  account?: FundAccount;
  skipped?: boolean;
}> {
  const name = String(args.name || "").trim();
  if (!name) {
    return { success: false, message: "账户名称不能为空" };
  }

  const existed = await getFundAccountByName(ctx.userId, name);
  if (existed) {
    return {
      success: true,
      message: "账户已存在，已跳过创建",
      account: existed,
      skipped: true,
    };
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

  return {
    success: true,
    message: "账户创建成功",
    account: created,
  };
}

export async function updateFundAccountBalanceByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<{
  success: boolean;
  message: string;
  account?: FundAccount;
}> {
  const currentBalance = Number(args.currentBalance);
  if (!Number.isFinite(currentBalance)) {
    return { success: false, message: "currentBalance 必须为数字" };
  }

  let account: FundAccount | null = null;
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
    return { success: false, message: "未找到对应资金账户" };
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

  return {
    success: true,
    message: "账户余额更新成功",
    account: updated,
  };
}

export async function batchAddFundAccountsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const list = Array.isArray(args.accountNames) ? args.accountNames : [];
  const names = list.map((x) => String(x || "").trim()).filter(Boolean);
  if (names.length === 0) {
    return { success: false, message: "accountNames 不能为空" };
  }

  const result = await createFundAccountsBatch({
    userId: ctx.userId,
    names,
    defaultCurrency: args.defaultCurrency ? String(args.defaultCurrency) : "CNY",
  });

  return {
    success: true,
    message: `批量创建完成，成功 ${result.created.length} 个，跳过 ${result.skipped.length} 个`,
    created: result.created.map((x) => ({
      id: x.id,
      name: x.name,
      accountType: x.accountType,
      currentBalance: x.currentBalance,
    })),
    skipped: result.skipped,
  };
}

export async function queryFundAccountsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
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

  return {
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
  };
}

/** 更新 */
export async function updateFundAccount(
  id: number,
  data: Prisma.FundAccountUpdateInput,
): Promise<FundAccount> {
  return prisma.fundAccount.update({ where: { id }, data });
}

/** 删除 */
export async function deleteFundAccount(id: number): Promise<FundAccount> {
  return prisma.fundAccount.delete({ where: { id } });
}
