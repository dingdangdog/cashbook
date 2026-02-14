import { encryptBySHA256, getUUID } from "../utils/common";
import prisma from "~~/server/lib/prisma";

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: 用户注册
 *     tags: ["Base"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             username: string 用户名
 *             password: string 密码
 *             name: string 显示名称（可选）
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: "注册成功"
 *       400:
 *         description: 注册失败
 *         content:
 *           application/json:
 *             schema:
 *               Error: {
 *                 message: 错误信息
 *               }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // console.log("body", body);
  if (!body.username || !body.password) {
    return;
  }

  const username = String(body.username);
  const password = encryptBySHA256(username, body.password);
  const name = body.name ? body.name : `MYNUXT_${getUUID(6)}`;

  const num = await prisma.user.count({
    where: {
      username: {
        equals: username,
      },
    },
  });
  if (num > 0) {
    return error("账号已存在");
  }

  const user = await prisma.user.create({
    data: {
      name: String(name),
      username,
      password,
    },
  });

  if (user) {
    return success("注册成功");
  }
  return error("注册失败");
});
