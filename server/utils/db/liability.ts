import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
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
