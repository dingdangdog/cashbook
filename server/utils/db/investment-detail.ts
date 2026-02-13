import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type InvestmentDetail =
  Awaited<ReturnType<typeof prisma.investmentDetail.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** InvestmentDetail 查询条件 */
export interface InvestmentDetailQueryWhere {
  id?: number;
  productId?: number;
  userId?: number;
  tradeType?: string;
  tradeDayStart?: Date | string;
  tradeDayEnd?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

function buildInvestmentDetailWhere(
  input: InvestmentDetailQueryWhere = {},
): Prisma.InvestmentDetailWhereInput {
  const where: Prisma.InvestmentDetailWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.productId != null) where.productId = input.productId;
  if (input.userId != null) where.userId = input.userId;
  if (input.tradeType) where.tradeType = input.tradeType;
  if (input.tradeDayStart || input.tradeDayEnd) {
    where.tradeDay = {};
    if (input.tradeDayStart)
      where.tradeDay.gte =
        input.tradeDayStart instanceof Date
          ? input.tradeDayStart
          : new Date(input.tradeDayStart);
    if (input.tradeDayEnd)
      where.tradeDay.lte =
        input.tradeDayEnd instanceof Date
          ? input.tradeDayEnd
          : new Date(input.tradeDayEnd);
  }
  if (input.minAmount != null || input.maxAmount != null) {
    where.amount = {};
    if (input.minAmount != null) where.amount.gte = input.minAmount;
    if (input.maxAmount != null) where.amount.lte = input.maxAmount;
  }
  return where;
}

/** 根据 ID 查询单条 */
export async function getInvestmentDetailById(
  id: number,
): Promise<InvestmentDetail | null> {
  return prisma.investmentDetail.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getInvestmentDetailsPage(
  whereInput: InvestmentDetailQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.InvestmentDetailOrderByWithRelationInput = {
    tradeDay: "desc",
    id: "desc",
  },
): Promise<PaginationResult<InvestmentDetail>> {
  const where = buildInvestmentDetailWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.investmentDetail.findMany({ where, orderBy, skip, take }),
    prisma.investmentDetail.count({ where }),
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
export async function createInvestmentDetail(
  data: Prisma.InvestmentDetailCreateInput,
): Promise<InvestmentDetail> {
  return prisma.investmentDetail.create({ data });
}

/** 更新 */
export async function updateInvestmentDetail(
  id: number,
  data: Prisma.InvestmentDetailUpdateInput,
): Promise<InvestmentDetail> {
  return prisma.investmentDetail.update({ where: { id }, data });
}

/** 删除 */
export async function deleteInvestmentDetail(
  id: number,
): Promise<InvestmentDetail> {
  return prisma.investmentDetail.delete({ where: { id } });
}
