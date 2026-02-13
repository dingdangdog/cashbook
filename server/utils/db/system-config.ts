import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type SystemConfig =
  Awaited<ReturnType<typeof prisma.systemConfig.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** SystemConfig 查询条件 */
export interface SystemConfigQueryWhere {
  id?: number;
  openRegister?: boolean;
}

function buildSystemConfigWhere(
  input: SystemConfigQueryWhere = {},
): Prisma.SystemConfigWhereInput {
  const where: Prisma.SystemConfigWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.openRegister != null) where.openRegister = input.openRegister;
  return where;
}

/** 根据 ID 查询单条 */
export async function getSystemConfigById(
  id: number,
): Promise<SystemConfig | null> {
  return prisma.systemConfig.findUnique({ where: { id } });
}

/** 分页查询（系统配置通常为单条，保留分页以保持一致性） */
export async function getSystemConfigsPage(
  whereInput: SystemConfigQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.SystemConfigOrderByWithRelationInput = { id: "asc" },
): Promise<PaginationResult<SystemConfig>> {
  const where = buildSystemConfigWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.systemConfig.findMany({ where, orderBy, skip, take }),
    prisma.systemConfig.count({ where }),
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
export async function createSystemConfig(
  data: Prisma.SystemConfigCreateInput,
): Promise<SystemConfig> {
  return prisma.systemConfig.create({ data });
}

/** 更新 */
export async function updateSystemConfig(
  id: number,
  data: Prisma.SystemConfigUpdateInput,
): Promise<SystemConfig> {
  return prisma.systemConfig.update({ where: { id }, data });
}

/** 删除 */
export async function deleteSystemConfig(id: number): Promise<SystemConfig> {
  return prisma.systemConfig.delete({ where: { id } });
}
