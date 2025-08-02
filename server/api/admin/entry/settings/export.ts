import prisma from "~/lib/prisma";

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
 *                   Receivable: [应收款数据],
 *                   FixedFlow: [固定流水数据],
 *                   TypeRelation: [类型关系数据]
 *                 }
 *               }
 */
// 递归函数：将对象中的所有 BigInt 转换为字符串
const convertBigIntToString = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === "bigint") {
    console.log(obj);

    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // 处理 BigInt
        if (typeof value === "bigint") {
          newObj[key] = value.toString();
        }
        // 处理 Date
        else if (value instanceof Date) {
          newObj[key] = value.toISOString();
        }
        // 递归处理嵌套对象/数组
        else {
          newObj[key] = convertBigIntToString(value);
        }
      }
    }
    return newObj;
  }

  return obj;
};

export default defineEventHandler(async (event) => {
  // 获取所有表名
  const tableNames: string[] = [
    "_prisma_migrations",
    "SystemSetting",
    "User",
    "Book",
    "Flow",
    "Budget",
    "Receivable",
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

    // Convert BigInt to string for JSON serialization
    if (data) {
      const serializedPageData = convertBigIntToString(data);
      allData[tableName] = serializedPageData;
    } else {
      allData[tableName] = null;
    }
  }

  // 返回文件流
  return success(allData);
});
