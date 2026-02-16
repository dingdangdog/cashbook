import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type Liability =
  Awaited<ReturnType<typeof prisma.liability.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** Liability 查询条件 */
export interface LiabilityQueryWhere {
  id?: number;
  userId?: number;
  name?: string;
  status?: number;
  occurDayStart?: Date | string;
  occurDayEnd?: Date | string;
  nameContains?: string;
}

function buildLiabilityWhere(
  input: LiabilityQueryWhere = {},
): Prisma.LiabilityWhereInput {
  const where: Prisma.LiabilityWhereInput = {};
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
export async function getLiabilityById(id: number): Promise<Liability | null> {
  return prisma.liability.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getLiabilitiesPage(
  whereInput: LiabilityQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.LiabilityOrderByWithRelationInput = {
    occurDay: "desc",
    id: "desc",
  },
): Promise<PaginationResult<Liability>> {
  const where = buildLiabilityWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.liability.findMany({ where, orderBy, skip, take }),
    prisma.liability.count({ where }),
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
export async function createLiability(
  data: Prisma.LiabilityCreateInput,
): Promise<Liability> {
  return prisma.liability.create({ data });
}

/** 更新 */
export async function updateLiability(
  id: number,
  data: Prisma.LiabilityUpdateInput,
): Promise<Liability> {
  return prisma.liability.update({ where: { id }, data });
}

/** 删除 */
export async function deleteLiability(id: number): Promise<Liability> {
  return prisma.liability.delete({ where: { id } });
}

export async function addLiabilityByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const name = String(args.name || "").trim();
  const money = Number(args.money ?? 0);
  if (!name) return { success: false, message: "name 不能为空" };
  if (!Number.isFinite(money) || money <= 0) {
    return { success: false, message: "money 必须大于0" };
  }

  const row = await createLiability({
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
  return { success: true, message: "负债已新增", liability: row };
}

export async function queryLiabilitiesByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(args.pageSize) || 20));
  const result = await getLiabilitiesPage(
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
