import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/settings/import:
 *   post:
 *     summary: 管理员导入系统数据
 *     tags: ["Admin Settings"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             file: File JSON格式的数据文件
 *     responses:
 *       200:
 *         description: 数据导入成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: "数据导入成功"
 *       400:
 *         description: 导入失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息
 *               }
 */
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
    // 获取当前系统版本号
    const currentSystemSetting = await prisma.systemSetting.findFirst({
      where: { id: 1 },
    });
    const currentVersion = currentSystemSetting?.version;

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
            // 跳过 _prisma_migrations 表，因为它可能包含重要的迁移历史
            if (tableName === "_prisma_migrations") {
              console.info(`跳过 ${tableName} 表的导入，保留现有迁移历史`);
              importStats[tableName].imported = importStats[tableName].total; // 标记为已处理
              continue;
            } else {
              // SQLite: 清空表数据（使用DELETE代替TRUNCATE）
              await prisma.$queryRawUnsafe(`DELETE FROM "${tableName}";`);

              // SQLite: 重置自增序列（如果存在）
              try {
                await prisma.$queryRawUnsafe(
                  `DELETE FROM sqlite_sequence WHERE name = '${tableName}';`
                );
              } catch (seqErr) {
                // 忽略序列表不存在的错误，继续执行
                console.warn(`重置序列失败 ${tableName}:`, seqErr);
              }
            }

            // 获取所有列名
            const columns = Object.keys(tableData[0]);
            const columnsWithQuotes = columns.map((column) => `"${column}"`);
            const columnsSql = columnsWithQuotes.join(", ");

            // 构建批量插入语句
            for (const item of tableData) {
              try {
                // 如果是SystemSetting表且是version字段，则保留当前版本
                if (
                  tableName === "SystemSetting" &&
                  currentVersion &&
                  item.id === 1
                ) {
                  item.version = currentVersion;
                }

                // 处理数据，特别是日期字段
                const processedItem = { ...item };

                // 调试：打印原始数据结构
                if (importStats[tableName].imported === 0) {
                  console.log(`表 ${tableName} 第一条数据结构:`, Object.keys(processedItem));
                  console.log(`表 ${tableName} 第一条数据值:`, processedItem);
                }

                // 检查并处理日期字段 - 更全面的检查
                const dateFields = [
                  "createDate",
                  "updateBy", 
                  "started_at",
                  "finished_at",
                ];
                
                for (const field of dateFields) {
                  if (field in processedItem) {
                    const value = processedItem[field];
                    // 检查各种空值情况
                    if (value === null || 
                        value === undefined || 
                        value === "" || 
                        value === "NULL" ||
                        (typeof value === 'string' && value.trim() === "")) {
                      console.log(`修复空日期字段 ${tableName}.${field}: ${value} -> 当前时间`);
                      processedItem[field] = new Date().toISOString();
                    }
                  }
                }

                const values = Object.values(processedItem)
                  .map((value) => {
                    if (value === null || value === undefined) {
                      return "NULL";
                    } else if (typeof value === "string") {
                      return `'${value.replace(/'/g, "''")}'`; // 转义单引号
                    } else if (typeof value === "boolean") {
                      return value ? 1 : 0; // SQLite 布尔值转换
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

          // SQLite: 检查表是否有自增主键
          try {
            const tableInfo = await prisma.$queryRawUnsafe(
              `PRAGMA table_info("${tableName}")`
            ) as Array<{
              cid: number;
              name: string;
              type: string;
              notnull: number;
              dflt_value: any;
              pk: number;
            }>;

            const hasAutoIncrement = tableInfo.some(
              (column) =>
                column.pk === 1 && column.type.toUpperCase().includes("INTEGER")
            );

            if (hasAutoIncrement && tableData.length > 0) {
              console.info("更新SQLite自增序列:", tableName);
              // SQLite: 更新自增序列到最大ID值
                             const maxIdResult = await prisma.$queryRawUnsafe(
                 `SELECT MAX(id) as max_id FROM "${tableName}"`
               ) as [{ max_id: number | null }];
              const maxId = maxIdResult[0]?.max_id || 0;

              if (maxId > 0) {
                try {
                  await prisma.$queryRawUnsafe(
                    `UPDATE sqlite_sequence SET seq = ${maxId} WHERE name = '${tableName}';`
                  );
                } catch (updateSeqErr) {
                  console.warn(`更新序列值失败 ${tableName}:`, updateSeqErr);
                  // 尝试插入新的序列记录
                  try {
                    await prisma.$queryRawUnsafe(
                      `INSERT INTO sqlite_sequence (name, seq) VALUES ('${tableName}', ${maxId});`
                    );
                  } catch (insertSeqErr) {
                    console.warn(
                      `插入序列记录失败 ${tableName}:`,
                      insertSeqErr
                    );
                  }
                }
              }
            }
          } catch (sequenceErr) {
            console.warn(`更新序列失败 ${tableName}:`, sequenceErr);
            // 继续执行，不要因为序列更新失败而中断整个导入过程
          }
        } catch (tableErr) {
          console.error(`处理表 ${tableName} 时出错:`, tableErr);
          hasErrors = true;
        }
      }
    });

    // 确保系统版本号是最新的
    if (currentVersion) {
      try {
        await prisma.systemSetting.update({
          where: { id: 1 },
          data: { version: currentVersion },
        });
      } catch (updateErr) {
        console.warn(
          "无法更新系统版本号，可能SystemSetting记录不存在:",
          updateErr
        );
        // 尝试创建SystemSetting记录
        try {
          await prisma.systemSetting.create({
            data: {
              id: 1,
              version: currentVersion,
              title: "",
              description: "",
              keywords: "",
              openRegister: false,
              createDate: new Date(),
              updateBy: new Date(),
            },
          });
          console.info("已创建新的SystemSetting记录");
        } catch (createErr) {
          console.warn("创建SystemSetting记录也失败:", createErr);
        }
      }
    }

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
