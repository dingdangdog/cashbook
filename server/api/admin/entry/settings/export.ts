import prisma from "~/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/admin/entry/settings/export:
 * get:
 * summary: 管理员导出系统数据
 * tags: ["Admin Settings"]
 * security:
 * - Admin: []
 * responses:
 * 200:
 * description: 数据导出成功
 * content:
 * application/json:
 * schema:
 * Result: {
 * d: {
 * SystemSetting: [系统设置数据],
 * User: [用户数据],
 * Book: [账本数据],
 * Flow: [流水数据],
 * Budget: [预算数据],
 * FixedFlow: [固定流水数据],
 * TypeRelation: [类型关系数据]
 * }
 * }
 */
export default defineEventHandler(async (event) => {
  // 定义需要导出的表名
  const tableNames: Prisma.ModelName[] = [
    "SystemSetting",
    "User",
    "Book",
    "Flow",
    "Budget",
    "FixedFlow",
    "TypeRelation",
  ];

  const allData: any = {};

  // 遍历所有表，查询数据并添加到allData对象中
  for (const tableName of tableNames) {
    const data = await (
      prisma[tableName as keyof typeof prisma] as any
    ).findMany();

    // 将 BigInt 类型转换为字符串，以确保 JSON 序列化正常
    const serializedData = data.map((item: any) => {
      const newItem: any = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          newItem[key] =
            typeof item[key] === "bigint" ? item[key].toString() : item[key];
        }
      }
      return newItem;
    });

    allData[tableName] = serializedData;
  }

  // 返回所有数据
  return success(allData);
});
