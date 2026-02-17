import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type ReceivableCollectPlan =
  Awaited<
    ReturnType<typeof prisma.receivableCollectPlan.findUnique>
  > extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** ReceivableCollectPlan 查询条件 */
export interface ReceivableCollectPlanQueryWhere {
  id?: number;
  receivableId?: number;
  termNo?: number;
  status?: number;
  planDayStart?: Date | string;
  planDayEnd?: Date | string;
}

function buildReceivableCollectPlanWhere(
  input: ReceivableCollectPlanQueryWhere = {},
): Prisma.ReceivableCollectPlanWhereInput {
  const where: Prisma.ReceivableCollectPlanWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.receivableId != null) where.receivableId = input.receivableId;
  if (input.termNo != null) where.termNo = input.termNo;
  if (input.status != null) where.status = input.status;
  if (input.planDayStart || input.planDayEnd) {
    where.planDay = {};
    if (input.planDayStart)
      where.planDay.gte =
        input.planDayStart instanceof Date
          ? input.planDayStart
          : new Date(input.planDayStart);
    if (input.planDayEnd)
      where.planDay.lte =
        input.planDayEnd instanceof Date
          ? input.planDayEnd
          : new Date(input.planDayEnd);
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getReceivableCollectPlanById(
  id: number,
): Promise<ReceivableCollectPlan | null> {
  return prisma.receivableCollectPlan.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getReceivableCollectPlansPage(
  whereInput: ReceivableCollectPlanQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.ReceivableCollectPlanOrderByWithRelationInput = {
    planDay: "asc",
    termNo: "asc",
  },
): Promise<PaginationResult<ReceivableCollectPlan>> {
  const where = buildReceivableCollectPlanWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.receivableCollectPlan.findMany({ where, orderBy, skip, take }),
    prisma.receivableCollectPlan.count({ where }),
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
export async function createReceivableCollectPlan(
  data: Prisma.ReceivableCollectPlanCreateInput,
): Promise<ReceivableCollectPlan> {
  return prisma.receivableCollectPlan.create({ data });
}

/** 更新 */
export async function updateReceivableCollectPlan(
  id: number,
  data: Prisma.ReceivableCollectPlanUpdateInput,
): Promise<ReceivableCollectPlan> {
  return prisma.receivableCollectPlan.update({ where: { id }, data });
}

/** 删除 */
export async function deleteReceivableCollectPlan(
  id: number,
): Promise<ReceivableCollectPlan> {
  return prisma.receivableCollectPlan.delete({ where: { id } });
}

export async function queryReceivableCollectPlansByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(args.pageSize) || 20));
  const status =
    args.status !== undefined && args.status !== null
      ? Number(args.status)
      : undefined;
  const keyword = args.keyword ? String(args.keyword).trim() : "";
  const startDay = args.startDay ? new Date(String(args.startDay)) : null;
  const endDay = args.endDay ? new Date(String(args.endDay)) : null;

  const receivables = await prisma.receivable.findMany({
    where: {
      userId: ctx.userId,
      ...(keyword
        ? { name: { contains: keyword, mode: "insensitive" as const } }
        : {}),
    },
    select: { id: true, name: true },
  });
  if (receivables.length === 0) {
    return {
      total: 0,
      pageNum,
      pageSize,
      data: [],
    };
  }

  const receivableIds = receivables.map((x) => x.id);
  const receivableNameMap = new Map(receivables.map((x) => [x.id, x.name]));
  const where: Prisma.ReceivableCollectPlanWhereInput = {
    receivableId: { in: receivableIds },
    ...(status !== undefined ? { status } : {}),
    ...(startDay || endDay
      ? {
          planDay: {
            ...(startDay ? { gte: startDay } : {}),
            ...(endDay ? { lte: endDay } : {}),
          },
        }
      : {}),
  };
  const { skip, take } = buildPagination({ pageNum, pageSize });

  const [total, data] = await Promise.all([
    prisma.receivableCollectPlan.count({ where }),
    prisma.receivableCollectPlan.findMany({
      where,
      orderBy: [{ planDay: "asc" }, { termNo: "asc" }],
      skip,
      take,
    }),
  ]);

  return {
    total,
    pageNum,
    pageSize,
    data: data.map((row) => ({
      ...row,
      receivableName: receivableNameMap.get(row.receivableId) ?? null,
    })),
  };
}
