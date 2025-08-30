import prisma from "~/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/admin/entry/settings/import:
 * post:
 * summary: 管理员导入系统数据
 * tags: ["Admin Settings"]
 * security:
 * - Admin: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * file: File JSON格式的数据文件
 * responses:
 * 200:
 * description: 数据导入成功
 * content:
 * application/json:
 * schema:
 * Result:
 * d: "数据导入成功"
 * 400:
 * description: 导入失败
 * content:
 * application/json:
 * schema:
 * Error: {
 * message: 错误信息
 * }
 */
export default defineEventHandler(async (event) => {
  const data = await readMultipartFormData(event);
  if (!data) {
    return error("请上传文件");
  }
  const file = data.find((item) => item.name === "file");

  if (!file) {
    return error("请上传JSON文件");
  }

  const fileContent = file.data;
  let allData: Record<string, any[]>;
  try {
    allData = JSON.parse(fileContent.toString("utf-8"));
  } catch (parseErr) {
    console.error("JSON解析错误:", parseErr);
    return error("JSON文件格式错误，无法解析");
  }

  const importOrder: Prisma.ModelName[] = [
    "SystemSetting",
    "User",
    "Book",
    "Flow",
    "Budget",
    "FixedFlow",
    "TypeRelation",
  ];

  try {
    const currentSystemSetting = await prisma.systemSetting.findFirst({
      where: { id: 1 },
    });
    const currentVersion = currentSystemSetting?.version;

    await prisma.$queryRaw`SET FOREIGN_KEY_CHECKS = 0;`;

    // 调整：将整个导入过程放在一个大的事务中，而不是在循环内部开启多个小事务
    await prisma.$transaction(async (tx) => {
      // 遍历所有表，清空数据并导入数据
      for (const tableName of importOrder) {
        try {
          const tableData = allData[tableName];
          if (!tableData || tableData.length === 0) {
            console.info(`表 ${tableName} 没有数据或数据为空，跳过导入`);
            continue;
          }

          // 清空表数据
          await tx.$queryRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);

          // 准备数据，处理版本和 BigInt
          const dataToInsert = tableData.map((item: any) => {
            if (tableName === "SystemSetting" && item.id === 1) {
              item.version = currentVersion;
            }

            // 确保 BigInt 类型正确 - 只对真正的 ID 字段进行转换
            const newItem: any = {};
            for (const key in item) {
              const value = item[key];
              // 只对 id 字段进行 BigInt 转换，其他字段保持原样
              if (key === 'id' && typeof value === "string" && /^\d+$/.test(value)) {
                try {
                  newItem[key] = BigInt(value);
                } catch (e) {
                  newItem[key] = value;
                }
              } else {
                newItem[key] = value;
              }
            }
            return newItem;
          });

          // **核心改动：使用 createMany 进行批量插入**
          const model = tx[tableName as keyof typeof tx] as any;
          if (model && model.createMany) {
            await model.createMany({
              data: dataToInsert,
              // skipDuplicates: true // 如果担心数据重复可以加上
            });
          } else {
            // 对于不支持 createMany 的表（如旧版本Prisma或某些特定模型），可以 fallback
            console.warn(`模型 ${tableName} 不支持 createMany，回退到单条插入`);
            for (const item of dataToInsert) {
              await model.create({ data: item });
            }
          }
        } catch (tableErr) {
          console.error(`处理表 ${tableName} 时出错:`, tableErr);
          throw new Error(`处理表 ${tableName} 时出错`); // 抛出错误以回滚事务
        }
      }
    });

    await prisma.$queryRaw`SET FOREIGN_KEY_CHECKS = 1;`;

    if (currentVersion) {
      await prisma.systemSetting.update({
        where: { id: 1 },
        data: { version: currentVersion },
      });
    }

    return success("数据导入成功");
  } catch (err: unknown) {
    console.error("Error importing data:", err);
    await prisma.$queryRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    return error(
      "导入数据失败: " + (err instanceof Error ? err.message : String(err))
    );
  }
});
