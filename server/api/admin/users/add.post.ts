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

  const existedCash = await prisma.fundAccount.findFirst({
    where: {
      userId: user.id,
      OR: [
        { name: { equals: "现金", mode: "insensitive" } },
        { accountType: "现金" },
      ],
    },
    select: { id: true },
  });
  if (!existedCash) {
    await prisma.fundAccount.create({
      data: {
        userId: user.id,
        name: "现金",
        accountType: "现金",
        currency: "CNY",
        initialBalance: 0,
        currentBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        totalLiability: 0,
        totalProfit: 0,
        status: 1,
        description: "系统默认现金账户",
      },
    });
  }

  return success(user);
});
