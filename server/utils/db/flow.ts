import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type Flow =
  Awaited<ReturnType<typeof prisma.flow.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** Flow 查询条件 */
export interface FlowQueryWhere {
  id?: number;
  userId?: number;
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
          : new Date(input.startDay);
    if (input.endDay)
      where.day.lte =
        input.endDay instanceof Date ? input.endDay : new Date(input.endDay);
  }
  if (input.minMoney != null || input.maxMoney != null) {
    where.money = {};
    if (input.minMoney != null) where.money.gte = input.minMoney;
    if (input.maxMoney != null) where.money.lte = input.maxMoney;
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getFlowById(id: number): Promise<Flow | null> {
  return prisma.flow.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getFlowsPage(
  whereInput: FlowQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.FlowOrderByWithRelationInput = { day: "desc", id: "desc" },
): Promise<PaginationResult<Flow>> {
  const where = buildFlowWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.flow.findMany({ where, orderBy, skip, take }),
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
  return prisma.flow.create({ data });
}

/** 更新 */
export async function updateFlow(
  id: number,
  data: Prisma.FlowUpdateInput,
): Promise<Flow> {
  return prisma.flow.update({ where: { id }, data });
}

/** 删除 */
export async function deleteFlow(id: number): Promise<Flow> {
  return prisma.flow.delete({ where: { id } });
}
