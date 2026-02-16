import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type InvestmentProduct =
  Awaited<
    ReturnType<typeof prisma.investmentProduct.findUnique>
  > extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** InvestmentProduct 查询条件 */
export interface InvestmentProductQueryWhere {
  id?: number;
  userId?: number;
  productName?: string;
  productType?: string;
  status?: number;
  productNameContains?: string;
}

function buildInvestmentProductWhere(
  input: InvestmentProductQueryWhere = {},
): Prisma.InvestmentProductWhereInput {
  const where: Prisma.InvestmentProductWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.productName) where.productName = input.productName;
  if (input.productType) where.productType = input.productType;
  if (input.status != null) where.status = input.status;
  if (input.productNameContains)
    where.productName = {
      contains: input.productNameContains,
      mode: "insensitive",
    };
  return where;
}

/** 根据 ID 查询单条 */
export async function getInvestmentProductById(
  id: number,
): Promise<InvestmentProduct | null> {
  return prisma.investmentProduct.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getInvestmentProductsPage(
  whereInput: InvestmentProductQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.InvestmentProductOrderByWithRelationInput = { id: "desc" },
): Promise<PaginationResult<InvestmentProduct>> {
  const where = buildInvestmentProductWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.investmentProduct.findMany({ where, orderBy, skip, take }),
    prisma.investmentProduct.count({ where }),
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
export async function createInvestmentProduct(
  data: Prisma.InvestmentProductCreateInput,
): Promise<InvestmentProduct> {
  return prisma.investmentProduct.create({ data });
}

/** 更新 */
export async function updateInvestmentProduct(
  id: number,
  data: Prisma.InvestmentProductUpdateInput,
): Promise<InvestmentProduct> {
  return prisma.investmentProduct.update({ where: { id }, data });
}

/** 删除 */
export async function deleteInvestmentProduct(
  id: number,
): Promise<InvestmentProduct> {
  return prisma.investmentProduct.delete({ where: { id } });
}

export async function addInvestmentProductByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const productName = String(args.productName || "").trim();
  if (!productName) return { success: false, message: "productName 不能为空" };
  const row = await createInvestmentProduct({
    userId: ctx.userId,
    productName,
    productType: args.productType ? String(args.productType) : null,
    totalInvested:
      args.totalInvested !== undefined ? Number(args.totalInvested) : 0,
    totalReturn: args.totalReturn !== undefined ? Number(args.totalReturn) : 0,
    currentValue:
      args.currentValue !== undefined ? Number(args.currentValue) : null,
    status: args.status != null ? Number(args.status) : 0,
  });
  return { success: true, message: "投资产品已新增", product: row };
}

export async function queryInvestmentProductsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(args.pageSize) || 20));
  const result = await getInvestmentProductsPage(
    {
      userId: ctx.userId,
      productType: args.productType ? String(args.productType) : undefined,
      status:
        args.status !== undefined && args.status !== null
          ? Number(args.status)
          : undefined,
      productNameContains: args.keyword ? String(args.keyword) : undefined,
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
