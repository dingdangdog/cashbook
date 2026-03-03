import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/settings/export:
 *   get:
 *     summary: 管理员导出系统数据
 *     tags: ["Admin Settings"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 数据导出成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   SystemSetting: [系统设置数据],
 *                   User: [用户数据],
 *                   Book: [账本数据],
 *                   Flow: [流水数据],
 *                   Budget: [预算数据],
 *                   FixedFlow: [固定流水数据],
 *                   TypeRelation: [类型关系数据]
 *                 }
 *               }
 */
export default defineEventHandler(async (event) => {
  // 获取所有表名
  const tableNames: string[] = [
    "_prisma_migrations",
    "SystemSetting",
    "User",
    "Book",
    "Flow",
    "Budget",
    "FixedFlow",
    "TypeRelation",
  ];
  // const tableNames: any[] = await prisma.$queryRaw`
  //   SELECT table_name
  //   FROM information_schema.tables
  //   WHERE table_schema = 'public' -- 替换为你的schema名称
  //   AND table_type = 'BASE TABLE'
  // `;
  // console.log(tableNames);
  const allData: any = {};

  // 遍历所有表，查询数据并添加到allData对象中
  for (const tableName of tableNames) {
    console.log(tableName);
    // const sql = 'SELECT * FROM "' + tableName + '"';
    const data = await prisma.$queryRawUnsafe(
      'SELECT * FROM "' + tableName + '";'
    );

    let serializedPageData;
    // Convert BigInt to string for JSON serialization
    if (data) {
      serializedPageData = Array.isArray(data)
        ? data.map((item: any) => ({
            ...item,
          }))
        : data;
      allData[tableName] = data;
    }
    allData[tableName] = serializedPageData;
  }

  // 返回文件流
  return success(allData);
});
