import { encryptBySHA256 } from "../utils/common";
import prisma from "~/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 用户登录
 *     tags: ["Base"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: {
 *                   id: 用户ID,
 *                   name: 用户名,
 *                   email: 邮箱,
 *                   token: JWT令牌
 *                 }
 *               }
 *       400:
 *         description: 登录失败
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
    return error("用户名或密码不能为空");
  }
  // console.log(credentials);
  const username = String(body.username);
  const password = String(body.password);

  const entrypassword = encryptBySHA256(username, password);
  const users = await prisma.user.findMany({
    where: {
      username: username,
      password: entrypassword,
    },
  });
  if (!users || users.length != 1) {
    return error("用户名或密码错误");
  }
  const user = users[0];
  const secretKey = useRuntimeConfig().authSecret;
  //  设置过期时间为 100 年后 (时间戳单位为秒)
  // const expiresInYears = 30;
  const expiresInDays = 30;
  const expiresInSeconds = expiresInDays * 24 * 60 * 60;
  const token = jwt.sign(
    { id: user.id, name: user.username, email: user.email },
    secretKey,
    {
      expiresIn: expiresInSeconds,
    }
  );
  const returnUser = {
    id: user.id,
    name: user.username,
    email: user.email,
    token,
    // image: user.avatar,
  };
  // useCookie()
  setCookie(event, "Authorization", token, {
    maxAge: expiresInSeconds,
  });
  return success(returnUser);
});
