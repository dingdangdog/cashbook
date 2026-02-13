import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type TypeRelation =
  Awaited<ReturnType<typeof prisma.typeRelation.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** TypeRelation 查询条件 */
export interface TypeRelationQueryWhere {
  id?: number;
  userId?: number;
  source?: string;
  target?: string;
  sourceContains?: string;
  targetContains?: string;
}

function buildTypeRelationWhere(
  input: TypeRelationQueryWhere = {},
): Prisma.TypeRelationWhereInput {
  const where: Prisma.TypeRelationWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.source) where.source = input.source;
  if (input.target) where.target = input.target;
  if (input.sourceContains)
    where.source = { contains: input.sourceContains, mode: "insensitive" };
  if (input.targetContains)
    where.target = { contains: input.targetContains, mode: "insensitive" };
  return where;
}

/** 根据 ID 查询单条 */
export async function getTypeRelationById(
  id: number,
): Promise<TypeRelation | null> {
  return prisma.typeRelation.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getTypeRelationsPage(
  whereInput: TypeRelationQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.TypeRelationOrderByWithRelationInput = { id: "desc" },
): Promise<PaginationResult<TypeRelation>> {
  const where = buildTypeRelationWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.typeRelation.findMany({ where, orderBy, skip, take }),
    prisma.typeRelation.count({ where }),
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
export async function createTypeRelation(
  data: Prisma.TypeRelationCreateInput,
): Promise<TypeRelation> {
  return prisma.typeRelation.create({ data });
}

/** 更新 */
export async function updateTypeRelation(
  id: number,
  data: Prisma.TypeRelationUpdateInput,
): Promise<TypeRelation> {
  return prisma.typeRelation.update({ where: { id }, data });
}

/** 删除 */
export async function deleteTypeRelation(id: number): Promise<TypeRelation> {
  return prisma.typeRelation.delete({ where: { id } });
}
