import { success, error } from "~~/server/utils/common";
import { updateUser } from "~~/server/utils/db/user";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body.id != null ? Number(body.id) : NaN;
  if (!id || Number.isNaN(id)) return error("缺少用户 id");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim() || "User";
  if (body.email !== undefined)
    data.email =
      body.email === "" || body.email == null
        ? null
        : String(body.email).trim();
  if (body.roles !== undefined)
    data.roles =
      body.roles === "" || body.roles == null
        ? null
        : String(body.roles).trim();

  await updateUser(id, data);
  return success("更新成功");
});
