import { encryptBySHA256 } from "../utils/common";
import prisma from "~/lib/prisma";

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
