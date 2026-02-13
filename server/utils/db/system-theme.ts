import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type SystemTheme =
  Awaited<ReturnType<typeof prisma.systemTheme.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** SystemTheme 查询条件 */
export interface SystemThemeQueryWhere {
  id?: string;
  code?: string;
  mode?: string;
  isActive?: boolean;
  isDefault?: boolean;
  nameContains?: string;
}

function buildSystemThemeWhere(
  input: SystemThemeQueryWhere = {},
): Prisma.SystemThemeWhereInput {
  const where: Prisma.SystemThemeWhereInput = {};
  if (input.id) where.id = input.id;
  if (input.code) where.code = input.code;
  if (input.mode) where.mode = input.mode;
  if (input.isActive != null) where.isActive = input.isActive;
  if (input.isDefault != null) where.isDefault = input.isDefault;
  if (input.nameContains)
    where.name = { contains: input.nameContains, mode: "insensitive" };
  return where;
}

/** 根据 ID 查询单条 */
export async function getSystemThemeById(
  id: string,
): Promise<SystemTheme | null> {
  return prisma.systemTheme.findUnique({ where: { id } });
}

/** 根据 code 查询单条 */
export async function getSystemThemeByCode(
  code: string,
): Promise<SystemTheme | null> {
  return prisma.systemTheme.findUnique({ where: { code } });
}

/** 分页查询 */
export async function getSystemThemesPage(
  whereInput: SystemThemeQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy:
    | Prisma.SystemThemeOrderByWithRelationInput
    | Prisma.SystemThemeOrderByWithRelationInput[] = [
    { sortBy: "asc" },
    { id: "asc" },
  ],
): Promise<PaginationResult<SystemTheme>> {
  const where = buildSystemThemeWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.systemTheme.findMany({ where, orderBy, skip, take }),
    prisma.systemTheme.count({ where }),
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
export async function createSystemTheme(
  data: Prisma.SystemThemeCreateInput,
): Promise<SystemTheme> {
  return prisma.systemTheme.create({ data });
}

/** 更新 */
export async function updateSystemTheme(
  id: string,
  data: Prisma.SystemThemeUpdateInput,
): Promise<SystemTheme> {
  return prisma.systemTheme.update({ where: { id }, data });
}

/** 删除 */
export async function deleteSystemTheme(id: string): Promise<SystemTheme> {
  return prisma.systemTheme.delete({ where: { id } });
}
