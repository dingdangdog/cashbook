import { getAuthPayload, hasAdminRole, success, error, noPermissions, encryptBySHA256 } from "~~/server/utils/common";
import { getUserById, updateUser } from "~~/server/utils/db/user";

export default defineEventHandler(async (event) => {
  const payload = getAuthPayload(event);
  if (!payload || !hasAdminRole(payload.roles)) {
    return noPermissions("需要管理员权限");
  }

  const body = await readBody(event);
  const userId = body.userId != null ? Number(body.userId) : body.id != null ? Number(body.id) : NaN;
  const newPassword = String(body.newPassword ?? body.password ?? "").trim();

  if (!userId || Number.isNaN(userId)) return error("缺少用户 id");
  if (!newPassword) return error("新密码不能为空");
  if (newPassword.length < 8) return error("新密码至少 8 个字符");

  const user = await getUserById(userId);
  if (!user) return error("用户不存在");

  const hashedPassword = encryptBySHA256(user.username, newPassword);
  await updateUser(userId, { password: hashedPassword });
  return success("密码已更新");
});
