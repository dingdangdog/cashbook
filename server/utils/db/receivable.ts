import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
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
