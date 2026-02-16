import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";
import {
  type AIToolContext,
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

type FixedFlow =
  Awaited<ReturnType<typeof prisma.fixedFlow.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;

/** FixedFlow 查询条件 */
export interface FixedFlowQueryWhere {
  id?: number;
  userId?: number;
  month?: string;
  flowType?: string;
  industryType?: string;
  payType?: string;
  nameContains?: string;
}

function buildFixedFlowWhere(
  input: FixedFlowQueryWhere = {},
): Prisma.FixedFlowWhereInput {
  const where: Prisma.FixedFlowWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.userId != null) where.userId = input.userId;
  if (input.month) where.month = input.month;
  if (input.flowType) where.flowType = input.flowType;
  if (input.industryType) where.industryType = input.industryType;
  if (input.payType) where.payType = input.payType;
  if (input.nameContains)
    where.name = { contains: input.nameContains, mode: "insensitive" };
  return where;
}

/** 根据 ID 查询单条 */
export async function getFixedFlowById(id: number): Promise<FixedFlow | null> {
  return prisma.fixedFlow.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getFixedFlowsPage(
  whereInput: FixedFlowQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.FixedFlowOrderByWithRelationInput = { id: "desc" },
): Promise<PaginationResult<FixedFlow>> {
  const where = buildFixedFlowWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.fixedFlow.findMany({ where, orderBy, skip, take }),
    prisma.fixedFlow.count({ where }),
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
export async function createFixedFlow(
  data: Prisma.FixedFlowCreateInput,
): Promise<FixedFlow> {
  return prisma.fixedFlow.create({ data });
}

/** 更新 */
export async function updateFixedFlow(
  id: number,
  data: Prisma.FixedFlowUpdateInput,
): Promise<FixedFlow> {
  return prisma.fixedFlow.update({ where: { id }, data });
}

/** 删除 */
export async function deleteFixedFlow(id: number): Promise<FixedFlow> {
  return prisma.fixedFlow.delete({ where: { id } });
}

export async function addFixedFlowByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const name = String(args.name || "").trim();
  if (!name) return { success: false, message: "name 不能为空" };
  const row = await createFixedFlow({
    userId: ctx.userId,
    month: args.month ? String(args.month) : null,
    money: args.money !== undefined ? Number(args.money) : null,
    name,
    description: args.description ? String(args.description) : null,
    flowType: args.flowType ? String(args.flowType) : null,
    industryType: args.industryType ? String(args.industryType) : null,
    payType: args.payType ? String(args.payType) : null,
    attribution: args.attribution ? String(args.attribution) : null,
  });
  return { success: true, message: "固定流水模板已新增", fixedFlow: row };
}

export async function queryFixedFlowsByAI(
  args: Record<string, unknown>,
  ctx: AIToolContext,
): Promise<Record<string, unknown>> {
  const pageNum = Math.max(1, Number(args.pageNum) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(args.pageSize) || 20));
  const result = await getFixedFlowsPage(
    {
      userId: ctx.userId,
      month: args.month ? String(args.month) : undefined,
      flowType: args.flowType ? String(args.flowType) : undefined,
      industryType: args.industryType ? String(args.industryType) : undefined,
      payType: args.payType ? String(args.payType) : undefined,
      nameContains: args.keyword ? String(args.keyword) : undefined,
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
