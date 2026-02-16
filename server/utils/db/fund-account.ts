import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type FundAccount =
  Awaited<
    ReturnType<typeof prisma.fundAccount.findUnique>
  > extends infer T
    ? T extends null
      ? never
      : T
    : never;

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
        name: { equals: name, mode: "insensitive" },
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
