import prisma from "~/lib/prisma";

/**
 * @swagger
 * /api/entry/user/changePassword:
 *   post:
 *     summary: 修改用户密码
 *     tags: ["User"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old
 *               - new
 *               - againNew
 *             properties:
 *               old:
 *                 type: string
 *                 description: 原密码
 *               new:
 *                 type: string
 *                 description: 新密码
 *               againNew:
 *                 type: string
 *                 description: 确认新密码
 *     responses:
 *       200:
 *         description: 密码修改成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: "更新成功"
 *               }
 *       400:
 *         description: 密码修改失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserId(event);

  if (!body.old || !body.new) {
    return;
  }
  if (body.new != body.againNew) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return;
  }
  const oldPassword = encryptBySHA256(user.username, String(body.old));
  if (oldPassword != user.password) {
    return error("原密码不正确！");
  }
  const newPassword = encryptBySHA256(user.username, String(body.new));

  const newUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: newPassword,
    },
  });

  return success("更新成功");
});
