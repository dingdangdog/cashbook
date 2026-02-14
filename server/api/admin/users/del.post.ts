import { getAuthPayload, hasAdminRole, success, error, noPermissions } from "~~/server/utils/common";
import { deleteUser } from "~~/server/utils/db/user";

export default defineEventHandler(async (event) => {
  const payload = getAuthPayload(event);
  if (!payload || !hasAdminRole(payload.roles)) {
    return noPermissions("需要管理员权限");
  }

  const body = await readBody(event);
  const id = body.id != null ? Number(body.id) : NaN;
  if (!id || Number.isNaN(id)) return error("缺少用户 id");

  await deleteUser(id);
  return success("删除成功");
});
