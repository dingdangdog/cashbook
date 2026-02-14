import { success, error, encryptBySHA256 } from "~~/server/utils/common";
import { createUser } from "~~/server/utils/db/user";
import prisma from "~~/server/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const name =
    body.name != null ? String(body.name).trim() : `User_${Date.now()}`;
  const email =
    body.email != null && body.email !== "" ? String(body.email).trim() : null;
  const roles =
    body.roles != null && body.roles !== "" ? String(body.roles).trim() : null;

  if (!username) return error("账号不能为空");
  if (username.length < 4) return error("账号至少 4 个字符");
  if (!password) return error("密码不能为空");
  if (password.length < 8) return error("密码至少 8 个字符");

  const exists = await prisma.user.count({ where: { username } });
  if (exists > 0) return error("账号已存在");

  const hashedPassword = encryptBySHA256(username, password);
  const user = await createUser({
    username,
    password: hashedPassword,
    name: name || "User",
    email,
    roles,
  });
  return success(user);
});
