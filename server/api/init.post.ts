import { encryptBySHA256, success, error } from "../utils/common";
import prisma from "~~/server/lib/prisma";

/**
 * 系统初始化（仅当系统中没有任何用户时可调用）
 * 请求体：systemConfig: { title?, description?, keywords?, openRegister? }, admin: { name, username, password }
 */
export default defineEventHandler(async (event) => {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return error("系统已初始化，无法重复执行");
  }

  const body = await readBody(event);
  const systemConfig = body.systemConfig || {};
  const admin = body.admin || {};

  const username = admin.username ? String(admin.username).trim() : "";
  const password = admin.password ? String(admin.password) : "";
  const name = admin.name ? String(admin.name).trim() : "管理员";

  if (!username || username.length < 4) {
    return error("超管账号至少 4 个字符");
  }
  if (!password || password.length < 8) {
    return error("超管密码至少 8 个字符");
  }

  const hashedPassword = encryptBySHA256(username, password);

  const existing = await prisma.user.findFirst({
    where: { username },
  });
  if (existing) {
    return error("该账号已存在");
  }

  await prisma.$transaction(async (tx) => {
    await tx.systemConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        title: systemConfig.title ?? "Cashbook",
        description: systemConfig.description ?? "",
        keywords: systemConfig.keywords ?? "",
        openRegister: Boolean(systemConfig.openRegister ?? false),
      },
      update: {
        title: systemConfig.title ?? undefined,
        description: systemConfig.description ?? undefined,
        keywords: systemConfig.keywords ?? undefined,
        openRegister:
          systemConfig.openRegister !== undefined
            ? Boolean(systemConfig.openRegister)
            : undefined,
      },
    });

    await tx.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        roles: "admin",
      },
    });
  });

  return success("初始化成功，请使用超管账号登录");
});
