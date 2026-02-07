import { noPermissions } from "../utils/common";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // 校验 API 请求
  if (url.pathname.startsWith("/api/entry")) {
    const token = getHeader(event, "Authorization");

    if (!token) {
      // Token is missing, return 401 Unauthorized
      return noPermissions("No Authorization");
    }
    const secretKey = useRuntimeConfig().authSecret;

    // 验证 JWT
    try {
      jwt.verify(token, secretKey);
    } catch (err) {
      return noPermissions("Forbidden: Invalid or expired token");
    }
  } else if (url.pathname.startsWith("/api/admin/entry")) {
    // 后台管理接口
    const Admin = getHeader(event, "Admin");
    if (!Admin) {
      console.error(new Date().toLocaleDateString() + " No Admin");
      return noPermissions();
    }
    const runtimeConfig = useRuntimeConfig();
    if (
      Admin !=
      encryptBySHA256(runtimeConfig.adminUsername, runtimeConfig.adminPassword)
    ) {
      console.error(new Date().toLocaleDateString() + " Admin is Wrong!");
      deleteCookie(event, "Admin");
      return noPermissions();
    }
  }
});
