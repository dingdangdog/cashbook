import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
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

export async function addInvestmentDetailByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const productId = Number(args.productId);
  const tradeType = String(args.tradeType || "").trim();
  const amount = Number(args.amount ?? 0);
  if (!Number.isFinite(productId) || productId <= 0) {
    return { success: false, message: "productId 无效" };
  }
  if (!tradeType) return { success: false, message: "tradeType 不能为空" };
  if (!Number.isFinite(amount) || amount === 0) {
    return { success: false, message: "amount 不能为0" };
  }
  const row = await createInvestmentDetail({
    userId: ctx.userId,
    productId,
    tradeType,
    tradeDay: args.tradeDay ? new Date(String(args.tradeDay)) : new Date(),
    amount,
    quantity: args.quantity !== undefined ? Number(args.quantity) : null,
    price: args.price !== undefined ? Number(args.price) : null,
    fee: args.fee !== undefined ? Number(args.fee) : 0,
    description: args.description ? String(args.description) : null,
    flowId: args.flowId !== undefined ? Number(args.flowId) : null,
  });
  return { success: true, message: "投资明细已新增", detail: row };
}

export async function queryInvestmentDetailsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(args.pageSize) || 20));
  const result = await getInvestmentDetailsPage(
    {
      userId: ctx.userId,
      productId:
        args.productId !== undefined && args.productId !== null
          ? Number(args.productId)
          : undefined,
      tradeType: args.tradeType ? String(args.tradeType) : undefined,
      tradeDayStart: args.startDay ? String(args.startDay) : undefined,
      tradeDayEnd: args.endDay ? String(args.endDay) : undefined,
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
