import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // 获取所有表名
  const tableNames: string[] = [
    "_prisma_migrations",
    "SystemSetting",
    "User",
    "Plan",
    "TypeRelation",
    "Book",
    "Flow",
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
    allData[tableName] = data;
  }

  // 返回文件流
  return success(allData);
});
