import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, name, username, password, email } = body;
  if (!id) {
    return error("Not Find ID");
  }
  const data: any = {};
  if (name) {
    data.name = name;
  }
  if (email) {
    data.email = email;
  }
  if (username && password) {
    data.username = username;
    data.password = encryptBySHA256(username, password);
  }
  // data.update
  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: data,
  });
  return success(updated);
});
