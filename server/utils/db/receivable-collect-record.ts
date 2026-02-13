import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type ReceivableCollectRecord =
  Awaited<
    ReturnType<typeof prisma.receivableCollectRecord.findUnique>
  > extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** ReceivableCollectRecord 查询条件 */
export interface ReceivableCollectRecordQueryWhere {
  id?: number;
  receivableId?: number;
  planId?: number;
  collectDayStart?: Date | string;
  collectDayEnd?: Date | string;
}

function buildReceivableCollectRecordWhere(
  input: ReceivableCollectRecordQueryWhere = {},
): Prisma.ReceivableCollectRecordWhereInput {
  const where: Prisma.ReceivableCollectRecordWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.receivableId != null) where.receivableId = input.receivableId;
  if (input.planId != null) where.planId = input.planId;
  if (input.collectDayStart || input.collectDayEnd) {
    where.collectDay = {};
    if (input.collectDayStart)
      where.collectDay.gte =
        input.collectDayStart instanceof Date
          ? input.collectDayStart
          : new Date(input.collectDayStart);
    if (input.collectDayEnd)
      where.collectDay.lte =
        input.collectDayEnd instanceof Date
          ? input.collectDayEnd
          : new Date(input.collectDayEnd);
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getReceivableCollectRecordById(
  id: number,
): Promise<ReceivableCollectRecord | null> {
  return prisma.receivableCollectRecord.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getReceivableCollectRecordsPage(
  whereInput: ReceivableCollectRecordQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.ReceivableCollectRecordOrderByWithRelationInput = {
    collectDay: "desc",
    id: "desc",
  },
): Promise<PaginationResult<ReceivableCollectRecord>> {
  const where = buildReceivableCollectRecordWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.receivableCollectRecord.findMany({ where, orderBy, skip, take }),
    prisma.receivableCollectRecord.count({ where }),
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
export async function createReceivableCollectRecord(
  data: Prisma.ReceivableCollectRecordCreateInput,
): Promise<ReceivableCollectRecord> {
  return prisma.receivableCollectRecord.create({ data });
}

/** 更新 */
export async function updateReceivableCollectRecord(
  id: number,
  data: Prisma.ReceivableCollectRecordUpdateInput,
): Promise<ReceivableCollectRecord> {
  return prisma.receivableCollectRecord.update({ where: { id }, data });
}

/** 删除 */
export async function deleteReceivableCollectRecord(
  id: number,
): Promise<ReceivableCollectRecord> {
  return prisma.receivableCollectRecord.delete({ where: { id } });
}
