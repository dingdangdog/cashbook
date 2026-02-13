import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type SystemAIProvider =
  Awaited<ReturnType<typeof prisma.systemAIProvider.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** SystemAIProvider 查询条件 */
export interface SystemAIProviderQueryWhere {
  id?: string;
  provider?: string;
  apiProtocol?: string;
  isActive?: boolean;
  nameContains?: string;
}

function buildSystemAIProviderWhere(
  input: SystemAIProviderQueryWhere = {},
): Prisma.SystemAIProviderWhereInput {
  const where: Prisma.SystemAIProviderWhereInput = {};
  if (input.id) where.id = input.id;
  if (input.provider) where.provider = input.provider;
  if (input.apiProtocol) where.apiProtocol = input.apiProtocol;
  if (input.isActive != null) where.isActive = input.isActive;
  if (input.nameContains)
    where.name = { contains: input.nameContains, mode: "insensitive" };
  return where;
}

/** 根据 ID 查询单条 */
export async function getSystemAIProviderById(
  id: string,
): Promise<SystemAIProvider | null> {
  return prisma.systemAIProvider.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getSystemAIProvidersPage(
  whereInput: SystemAIProviderQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.SystemAIProviderOrderByWithRelationInput = {
    createdAt: "desc",
  },
): Promise<PaginationResult<SystemAIProvider>> {
  const where = buildSystemAIProviderWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.systemAIProvider.findMany({ where, orderBy, skip, take }),
    prisma.systemAIProvider.count({ where }),
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
export async function createSystemAIProvider(
  data: Prisma.SystemAIProviderCreateInput,
): Promise<SystemAIProvider> {
  return prisma.systemAIProvider.create({ data });
}

/** 更新 */
export async function updateSystemAIProvider(
  id: string,
  data: Prisma.SystemAIProviderUpdateInput,
): Promise<SystemAIProvider> {
  return prisma.systemAIProvider.update({ where: { id }, data });
}

/** 删除 */
export async function deleteSystemAIProvider(
  id: string,
): Promise<SystemAIProvider> {
  return prisma.systemAIProvider.delete({ where: { id } });
}
