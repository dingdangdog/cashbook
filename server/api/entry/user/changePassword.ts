import prisma from "~/lib/prisma";

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
