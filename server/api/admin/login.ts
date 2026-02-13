import { encryptBySHA256 } from "../../utils/common";
import prisma from "~~/server/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 管理员登录（需 User.roles 含 admin）
 *     tags: ["Admin"]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             account: string 管理员账号（即 username）
 *             password: string 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 登录失败
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const account = String(body?.account || "").trim();
  const password = String(body?.password || "");

  if (!account || !password) {
    return error("账号或密码不能为空");
  }

  const entryPassword = encryptBySHA256(account, password);

  const user = await prisma.user.findFirst({
    where: { username: account, password: entryPassword },
  });

  if (!user) {
    return error("账号或密码错误");
  }

  const roles = user.roles ?? "";
  const isAdmin = roles.split(",").map((r) => r.trim()).includes("admin");
  if (!isAdmin) {
    return error("无管理员权限");
  }

  const secretKey = useRuntimeConfig().authSecret;
  const expiresInDays = 7;
  const expiresInSeconds = expiresInDays * 24 * 60 * 60;

  const tokenPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    roles: user.roles,
  };

  const token = jwt.sign(tokenPayload, secretKey, {
    expiresIn: expiresInSeconds,
  });

  setCookie(event, "Authorization", token, {
    maxAge: expiresInSeconds,
    httpOnly: true,
    sameSite: "lax",
  });

  return success({ token });
});
