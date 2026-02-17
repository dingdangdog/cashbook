import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type LiabilityRepayPlan =
  Awaited<
    ReturnType<typeof prisma.liabilityRepayPlan.findUnique>
  > extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** LiabilityRepayPlan 查询条件 */
export interface LiabilityRepayPlanQueryWhere {
  id?: number;
  liabilityId?: number;
  termNo?: number;
  status?: number;
  planDayStart?: Date | string;
  planDayEnd?: Date | string;
}

function buildLiabilityRepayPlanWhere(
  input: LiabilityRepayPlanQueryWhere = {},
): Prisma.LiabilityRepayPlanWhereInput {
  const where: Prisma.LiabilityRepayPlanWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.liabilityId != null) where.liabilityId = input.liabilityId;
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
export async function getLiabilityRepayPlanById(
  id: number,
): Promise<LiabilityRepayPlan | null> {
  return prisma.liabilityRepayPlan.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getLiabilityRepayPlansPage(
  whereInput: LiabilityRepayPlanQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.LiabilityRepayPlanOrderByWithRelationInput = {
    planDay: "asc",
    termNo: "asc",
  },
): Promise<PaginationResult<LiabilityRepayPlan>> {
  const where = buildLiabilityRepayPlanWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.liabilityRepayPlan.findMany({ where, orderBy, skip, take }),
    prisma.liabilityRepayPlan.count({ where }),
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
export async function createLiabilityRepayPlan(
  data: Prisma.LiabilityRepayPlanCreateInput,
): Promise<LiabilityRepayPlan> {
  return prisma.liabilityRepayPlan.create({ data });
}

/** 更新 */
export async function updateLiabilityRepayPlan(
  id: number,
  data: Prisma.LiabilityRepayPlanUpdateInput,
): Promise<LiabilityRepayPlan> {
  return prisma.liabilityRepayPlan.update({ where: { id }, data });
}

/** 删除 */
export async function deleteLiabilityRepayPlan(
  id: number,
): Promise<LiabilityRepayPlan> {
  return prisma.liabilityRepayPlan.delete({ where: { id } });
}

export async function queryLiabilityRepayPlansByAI(
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

  const liabilities = await prisma.liability.findMany({
    where: {
      userId: ctx.userId,
      ...(keyword
        ? { name: { contains: keyword, mode: "insensitive" as const } }
        : {}),
    },
    select: { id: true, name: true },
  });
  if (liabilities.length === 0) {
    return {
      total: 0,
      pageNum,
      pageSize,
      data: [],
    };
  }

  const liabilityIds = liabilities.map((x) => x.id);
  const liabilityNameMap = new Map(liabilities.map((x) => [x.id, x.name]));
  const where: Prisma.LiabilityRepayPlanWhereInput = {
    liabilityId: { in: liabilityIds },
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
    prisma.liabilityRepayPlan.count({ where }),
    prisma.liabilityRepayPlan.findMany({
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
      liabilityName: liabilityNameMap.get(row.liabilityId) ?? null,
    })),
  };
}
