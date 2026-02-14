import { success } from "~~/server/utils/common";
import { getUsersPage } from "~~/server/utils/db/user";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const pageNum = Number(body.pageNum ?? 1);
  const pageSize = Number(body.pageSize ?? 15);
  const where: Record<string, unknown> = {};
  if (body.id != null && body.id !== "") where.id = Number(body.id);
  if (body.username) where.usernameContains = String(body.username).trim();
  if (body.name) where.nameContains = String(body.name).trim();

  const result = await getUsersPage(where, { pageNum, pageSize });
  return success({ total: result.total, data: result.data });
});
