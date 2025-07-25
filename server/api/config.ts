import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: 获取系统配置信息
 *     tags: ["Base"]
 *     responses:
 *       200:
 *         description: 系统配置获取成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
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
    select: {
      title: true,
      description: true,
      keywords: true,
      version: true,
      openRegister: true,
    },
    where: {
      id: 1,
    },
  });
  return success(settings);
});
