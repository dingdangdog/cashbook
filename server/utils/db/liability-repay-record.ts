import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type LiabilityRepayRecord =
  Awaited<
    ReturnType<typeof prisma.liabilityRepayRecord.findUnique>
  > extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** LiabilityRepayRecord 查询条件 */
export interface LiabilityRepayRecordQueryWhere {
  id?: number;
  liabilityId?: number;
  planId?: number;
  repayDayStart?: Date | string;
  repayDayEnd?: Date | string;
}

function buildLiabilityRepayRecordWhere(
  input: LiabilityRepayRecordQueryWhere = {},
): Prisma.LiabilityRepayRecordWhereInput {
  const where: Prisma.LiabilityRepayRecordWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.liabilityId != null) where.liabilityId = input.liabilityId;
  if (input.planId != null) where.planId = input.planId;
  if (input.repayDayStart || input.repayDayEnd) {
    where.repayDay = {};
    if (input.repayDayStart)
      where.repayDay.gte =
        input.repayDayStart instanceof Date
          ? input.repayDayStart
          : new Date(input.repayDayStart);
    if (input.repayDayEnd)
      where.repayDay.lte =
        input.repayDayEnd instanceof Date
          ? input.repayDayEnd
          : new Date(input.repayDayEnd);
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getLiabilityRepayRecordById(
  id: number,
): Promise<LiabilityRepayRecord | null> {
  return prisma.liabilityRepayRecord.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getLiabilityRepayRecordsPage(
  whereInput: LiabilityRepayRecordQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.LiabilityRepayRecordOrderByWithRelationInput = {
    repayDay: "desc",
    id: "desc",
  },
): Promise<PaginationResult<LiabilityRepayRecord>> {
  const where = buildLiabilityRepayRecordWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.liabilityRepayRecord.findMany({ where, orderBy, skip, take }),
    prisma.liabilityRepayRecord.count({ where }),
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
export async function createLiabilityRepayRecord(
  data: Prisma.LiabilityRepayRecordCreateInput,
): Promise<LiabilityRepayRecord> {
  return prisma.liabilityRepayRecord.create({ data });
}

/** 更新 */
export async function updateLiabilityRepayRecord(
  id: number,
  data: Prisma.LiabilityRepayRecordUpdateInput,
): Promise<LiabilityRepayRecord> {
  return prisma.liabilityRepayRecord.update({ where: { id }, data });
}

/** 删除 */
export async function deleteLiabilityRepayRecord(
  id: number,
): Promise<LiabilityRepayRecord> {
  return prisma.liabilityRepayRecord.delete({ where: { id } });
}
