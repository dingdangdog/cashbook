import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
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
