import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // 1. 读取上传的文件
  const data = await readMultipartFormData(event);
  if (!data) {
    return error("请上传文件");
  }
  const file = data.find((item) => item.name === "file");

  if (!file) {
    return error("请上传JSON文件");
  }

  // 直接读取文件内容
  const fileContent = file.data;

  // 在内存中处理文件内容
  const allData = JSON.parse(fileContent.toString("utf-8"));
  // const allData = JSON.parse(rawData);

  try {
    // 开启事务
    await prisma.$transaction(async (prisma) => {
      // 2. 遍历所有表，清空数据并导入数据
      for (const tableName in allData) {
        // 清空表数据
        // await prisma.$executeRaw`TRUNCATE TABLE ${tableName}`;
        await prisma.$queryRawUnsafe('TRUNCATE TABLE "' + tableName + '";');

        const tableData = allData[tableName];

        // 导入数据
        for (const item of tableData) {
          // 构建插入语句
          const columns = Object.keys(item);
          const values = Object.values(item)
            .map((value) => {
              if (typeof value === "string") {
                return `'${value.replace(/'/g, "''")}'`; // 转义单引号
              } else if (typeof value === "boolean") {
                return value;
              } else if (typeof value === "number") {
                return value;
              } else {
                return "NULL";
              }
            })
            .join(",");

          // 将columns每个元素拼上双引号
          const columnsWithQuotes = columns.map((column) => `"${column}"`);
          const columnsSql = columnsWithQuotes.join(", ");
          // console.log(tableName, columnsSql, values);
          await prisma.$queryRawUnsafe(
            'INSERT INTO "' +
              tableName +
              '" (' +
              columnsSql +
              ") VALUES (" +
              values +
              ");"
          );
        }
      }
    });

    // console.log(`Data imported from ${file.name}`);
    return success("数据导入成功");
  } catch (err) {
    console.error("Error importing data:", err);
    return error("导入数据失败");
  }
});
