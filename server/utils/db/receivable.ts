import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type Receivable =
  Awaited<ReturnType<typeof prisma.receivable.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** Receivable 查询条件 */
export interface ReceivableQueryWhere {
  id?: number;
  userId?: number;
  name?: string;
  status?: number;
  occurDayStart?: Date | string;
  occurDayEnd?: Date | string;
  nameContains?: string;
}

function buildReceivableWhere(
  input: ReceivableQueryWhere = {},
): Prisma.ReceivableWhereInput {
  const where: Prisma.ReceivableWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.name) where.name = input.name;
  if (input.status != null) where.status = input.status;
  if (input.nameContains)
    where.name = { contains: input.nameContains, mode: "insensitive" };
  if (input.occurDayStart || input.occurDayEnd) {
    where.occurDay = {};
    if (input.occurDayStart)
      where.occurDay.gte =
        input.occurDayStart instanceof Date
          ? input.occurDayStart
          : new Date(input.occurDayStart);
    if (input.occurDayEnd)
      where.occurDay.lte =
        input.occurDayEnd instanceof Date
          ? input.occurDayEnd
          : new Date(input.occurDayEnd);
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getReceivableById(
  id: number,
): Promise<Receivable | null> {
  return prisma.receivable.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getReceivablesPage(
  whereInput: ReceivableQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.ReceivableOrderByWithRelationInput = {
    occurDay: "desc",
    id: "desc",
  },
): Promise<PaginationResult<Receivable>> {
  const where = buildReceivableWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.receivable.findMany({ where, orderBy, skip, take }),
    prisma.receivable.count({ where }),
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
export async function createReceivable(
  data: Prisma.ReceivableCreateInput,
): Promise<Receivable> {
  return prisma.receivable.create({ data });
}

/** 更新 */
export async function updateReceivable(
  id: number,
  data: Prisma.ReceivableUpdateInput,
): Promise<Receivable> {
  return prisma.receivable.update({ where: { id }, data });
}

/** 删除 */
export async function deleteReceivable(id: number): Promise<Receivable> {
  return prisma.receivable.delete({ where: { id } });
}

export async function addReceivableByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const name = String(args.name || "").trim();
  const money = Number(args.money ?? 0);
  if (!name) return { success: false, message: "name 不能为空" };
  if (!Number.isFinite(money) || money <= 0) {
    return { success: false, message: "money 必须大于0" };
  }

  const row = await createReceivable({
    userId: ctx.userId,
    name,
    description: args.description ? String(args.description) : null,
    occurDay: args.occurDay ? new Date(String(args.occurDay)) : new Date(),
    money,
    planType: args.planType != null ? Number(args.planType) : 0,
    interestRate:
      args.interestRate !== undefined ? Number(args.interestRate) : null,
    termCount: args.termCount !== undefined ? Number(args.termCount) : null,
    termAmount: args.termAmount !== undefined ? Number(args.termAmount) : null,
    status: args.status != null ? Number(args.status) : 0,
    occurFlowId:
      args.occurFlowId !== undefined ? Number(args.occurFlowId) : null,
  });
  return { success: true, message: "应收已新增", receivable: row };
}

export async function queryReceivablesByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(args.pageSize) || 20));
  const result = await getReceivablesPage(
    {
      userId: ctx.userId,
      status:
        args.status !== undefined && args.status !== null
          ? Number(args.status)
          : undefined,
      nameContains: args.keyword ? String(args.keyword) : undefined,
      occurDayStart: args.startDay ? String(args.startDay) : undefined,
      occurDayEnd: args.endDay ? String(args.endDay) : undefined,
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
