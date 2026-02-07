import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/settings/get:
 *   get:
 *     summary: 管理员获取系统设置
 *     tags: ["Admin Settings"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 系统设置获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   id: 设置ID,
 *                   title: 系统标题,
 *                   description: 系统描述,
 *                   keywords: 关键词,
 *                   version: 版本号,
 *                   openRegister: 是否开放注册
 *                 }
 *               }
 */
export default defineEventHandler(async (event) => {
  const settings = await prisma.systemSetting.findUnique({
    where: {
      id: 1,
    },
  });

  return success(settings);
});
