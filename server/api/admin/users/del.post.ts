import { success, error } from "~~/server/utils/common";
import { deleteUser } from "~~/server/utils/db/user";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body.id != null ? Number(body.id) : NaN;
  if (!id || Number.isNaN(id)) return error("缺少用户 id");

  await deleteUser(id);
  return success("删除成功");
});
