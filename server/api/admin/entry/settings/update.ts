import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/admin/entry/settings/update:
 *   post:
 *     summary: 管理员更新系统设置
 *     tags: ["Admin Settings"]
 *     security:
 *       - Admin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             title: string 系统标题
 *             description: string 系统描述
 *             keywords: string 关键词
 *             version: string 版本号
 *             openRegister: boolean 是否开放注册
 *     responses:
 *       200:
 *         description: 系统设置更新成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: SystemSetting 更新后的系统设置信息
 */
export default defineEventHandler(async (event) => {
  const { title, description, keywords, version, openRegister } =
    await readBody(event);

  const settings = await prisma.systemSetting.update({
    where: { id: 1 },
    data: {
      title,
      description,
      keywords,
      version,
      openRegister,
      updateBy: new Date(),
    },
  });

  return success(settings);
});
