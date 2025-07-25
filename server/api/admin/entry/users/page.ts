import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/users/page:
 *   post:
 *     summary: 管理员分页获取用户列表
 *     tags: ["Admin Users"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 description: 用户ID（可选）
 *               name:
 *                 type: string
 *                 description: 用户姓名（可选，支持模糊查询）
 *               username:
 *                 type: string
 *                 description: 用户名（可选，支持模糊查询）
 *               email:
 *                 type: string
 *                 description: 邮箱（可选，支持模糊查询）
 *               pageNum:
 *                 type: number
 *                 description: 页码（默认为1）
 *               pageSize:
 *                 type: number
 *                 description: 每页大小（默认为15，-1表示查询全部）
 *     responses:
 *       200:
 *         description: 分页数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   total: 总记录数,
 *                   data: [用户列表],
 *                   pages: 总页数
 *                 }
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取查询参数
  const { name, username, email, id } = await readBody(event); // 获取查询参数

  const where: any = {}; // 条件查询

  // 添加条件：如果 `name` 存在，则根据 `name` 查询
  if (id) {
    // equals 等于查询
    // contains 模糊查询（pgsql和mongo中，可以增加额外参数限制忽略大小写 mode: 'insensitive'）
    where.id = {
      equals: Number(id),
    };
  }

  // 如果 `email` 存在，则根据 `email` 查询
  if (name) {
    where.name = {
      contains: name,
    };
  }
  if (username) {
    where.username = {
      contains: username,
    };
  }
  if (email) {
    where.email = {
      contains: email,
    };
  }

  // 分页条件
  const pageNum = Number(body.pageNum ? body.pageNum : 1);
  const pageSize = Number(body.pageSize ? body.pageSize : 15);
  const skip = (pageNum - 1) * pageSize; // 计算跳过的条目数

  // 排序条件
  const orderBy: any = {
    createDate: "desc",
  };
  if (pageSize == -1) {
    // 查询全部
    const datas = await prisma.user.findMany({ where, orderBy });
    return success({ total: datas.length, data: datas, pages: 1 });
  }
  // 【条件、排序、分页】 组合查询
  const users = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  // 计算总页数
  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / pageSize);

  return success({ total: totalUsers, data: users, pages: totalPages });
});
