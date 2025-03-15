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
  let allData: Record<string, any[]>;
  try {
    allData = JSON.parse(fileContent.toString("utf-8"));
  } catch (parseErr) {
    console.error("JSON解析错误:", parseErr);
    return error("JSON文件格式错误，无法解析");
  }

  try {
    // 记录导入的表和行数
    const importStats: Record<string, { total: number; imported: number }> = {};
    let hasErrors = false;

    // 开启事务
    await prisma.$transaction(async (prisma) => {
      // 2. 遍历所有表，清空数据并导入数据
      for (const tableName in allData) {
        try {
          const tableData = allData[tableName];
          importStats[tableName] = { total: tableData.length, imported: 0 };

          // 批量导入数据
          if (tableData.length > 0) {
            // 清空表数据并重置序列（自动更新索引）
            await prisma.$queryRawUnsafe(
              `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`
            );

            // 获取所有列名
            const columns = Object.keys(tableData[0]);
            const columnsWithQuotes = columns.map((column) => `"${column}"`);
            const columnsSql = columnsWithQuotes.join(", ");

            // 构建批量插入语句
            for (const item of tableData) {
              try {
                const values = Object.values(item)
                  .map((value) => {
                    if (value === null) {
                      return "NULL";
                    } else if (typeof value === "string") {
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

                // 执行插入并保留ID
                await prisma.$queryRawUnsafe(
                  `INSERT INTO "${tableName}" (${columnsSql}) VALUES (${values});`
                );
                importStats[tableName].imported++;
              } catch (insertErr) {
                console.error(`插入数据到表 ${tableName} 失败:`, insertErr);
                hasErrors = true;
              }
            }
          } else {
            console.info(`表 ${tableName} 没有数据`);
            // 跳过
            continue;
          }

          // 检查是否有自增ID序列需要更新
          const hasIdSequence = await prisma.$queryRaw<
            [{ has_sequence: boolean }]
          >`
            SELECT EXISTS (
              SELECT 1 FROM pg_class c 
              JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE c.relkind = 'S' 
              AND n.nspname = 'public'
              AND c.relname = ${`${tableName}_id_seq`}
            ) as has_sequence;
          `;

          // console.error("更新序列:", hasIdSequence);
          if (hasIdSequence[0]?.has_sequence) {
            console.info("更新主键序列:", tableName);
            // 更新序列
            await prisma.$queryRawUnsafe(`
              SELECT setval('"${tableName}_id_seq"', 
              COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1, false);
            `);
          }
        } catch (tableErr) {
          console.error(`处理表 ${tableName} 时出错:`, tableErr);
          hasErrors = true;
        }
      }
    });

    // 检查是否所有数据都成功导入
    let totalRecords = 0;
    let importedRecords = 0;
    for (const table in importStats) {
      totalRecords += importStats[table].total;
      importedRecords += importStats[table].imported;
    }

    if (hasErrors || totalRecords !== importedRecords) {
      console.error("导入统计:", importStats);
      return error(
        `数据导入不完整，成功导入 ${importedRecords}/${totalRecords} 条记录`
      );
    }

    console.log("导入统计:", importStats);
    return success("数据导入成功");
  } catch (err: unknown) {
    console.error("Error importing data:", err);
    return error(
      "导入数据失败: " + (err instanceof Error ? err.message : String(err))
    );
  }
});
