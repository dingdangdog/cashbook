import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type Budget =
  Awaited<ReturnType<typeof prisma.budget.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** Budget 查询条件 */
export interface BudgetQueryWhere {
  id?: number;
  userId?: number;
  month?: string;
}

function buildBudgetWhere(
  input: BudgetQueryWhere = {},
): Prisma.BudgetWhereInput {
  const where: Prisma.BudgetWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.month) where.month = input.month;
  return where;
}

/** 根据 ID 查询单条 */
export async function getBudgetById(id: number): Promise<Budget | null> {
  return prisma.budget.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getBudgetsPage(
  whereInput: BudgetQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.BudgetOrderByWithRelationInput = {
    month: "desc",
    id: "desc",
  },
): Promise<PaginationResult<Budget>> {
  const where = buildBudgetWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.budget.findMany({ where, orderBy, skip, take }),
    prisma.budget.count({ where }),
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
export async function createBudget(
  data: Prisma.BudgetCreateInput,
): Promise<Budget> {
  return prisma.budget.create({ data });
}

/** 更新 */
export async function updateBudget(
  id: number,
  data: Prisma.BudgetUpdateInput,
): Promise<Budget> {
  return prisma.budget.update({ where: { id }, data });
}

/** 删除 */
export async function deleteBudget(id: number): Promise<Budget> {
  return prisma.budget.delete({ where: { id } });
}

export async function setBudgetByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const month = String(args.month || "").trim();
  const budget = Number(args.budget ?? 0);
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, message: "month 必须是 YYYY-MM" };
  }
  if (!Number.isFinite(budget)) {
    return { success: false, message: "budget 必须是数字" };
  }

  const existed = await prisma.budget.findFirst({
    where: { userId: ctx.userId, month },
  });
  const row = existed
    ? await prisma.budget.update({
        where: { id: existed.id },
        data: {
          budget,
          ...(args.used !== undefined && { used: Number(args.used) }),
        },
      })
    : await prisma.budget.create({
        data: {
          userId: ctx.userId,
          month,
          budget,
          used: args.used !== undefined ? Number(args.used) : 0,
        },
      });

  return { success: true, message: "预算已保存", budget: row };
}

export async function queryBudgetsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(args.pageSize) || 12));
  const result = await getBudgetsPage(
    {
      userId: ctx.userId,
      month: args.month ? String(args.month) : undefined,
    },
    { pageNum, pageSize },
  );
  return {
    total: result.total,
    pageNum: result.pageNum,
    pageSize: result.pageSize,
    data: result.data,
  };
}
