import prisma from "~~/server/lib/prisma";
import type { Prisma } from "~~/prisma/generated/client";

type User =
  Awaited<ReturnType<typeof prisma.user.findUnique>> extends infer T
    ? T extends null
      ? never
      : T
    : never;
import {
  type PaginationParams,
  type PaginationResult,
  buildPagination,
  calcTotalPages,
} from "./types";

/** User 查询条件 */
export interface UserQueryWhere {
  id?: number;
  username?: string;
  email?: string;
  roles?: string;
  /** 用户名模糊 */
  usernameContains?: string;
  /** 名称模糊 */
  nameContains?: string;
}

function buildUserWhere(input: UserQueryWhere = {}): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (input.id != null) where.id = input.id;
  if (input.username) where.username = input.username;
  if (input.email) where.email = input.email;
  if (input.roles) where.roles = input.roles;
  if (input.usernameContains)
    where.username = { contains: input.usernameContains, mode: "insensitive" };
  if (input.nameContains)
    where.name = { contains: input.nameContains, mode: "insensitive" };
  return where;
}

/** 根据 ID 查询单条 */
export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

/** 分页查询 */
export async function getUsersPage(
  whereInput: UserQueryWhere = {},
  pagination: PaginationParams = {},
  orderBy: Prisma.UserOrderByWithRelationInput = { id: "desc" },
): Promise<PaginationResult<User>> {
  const where = buildUserWhere(whereInput);
  const { skip, take, pageNum, pageSize } = buildPagination(pagination);

  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip, take }),
    prisma.user.count({ where }),
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
export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

/** 更新 */
export async function updateUser(
  id: number,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

/** 删除 */
export async function deleteUser(id: number): Promise<User> {
  return prisma.user.delete({ where: { id } });
}
