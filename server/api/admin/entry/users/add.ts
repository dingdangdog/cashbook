import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  const username = String(body.username);
  const name = String(body.name);
  const password = String(body.password);
  const email = String(body.email);
  const entryPassword = encryptBySHA256(username, password);
  // 在数据库中添加新数据
  const created = await prisma.user.create({
    data: {
      username,
      email,
      name,
      password: entryPassword,
    },
  });
  return success(created);
});
