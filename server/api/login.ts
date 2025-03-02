import { encryptBySHA256 } from "../utils/common";
import prisma from "~/lib/prisma";
import jwt from "jsonwebtoken";

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
