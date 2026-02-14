import { noPermissions } from "../utils/common";
import { getAuthPayload, hasAdminRole } from "../utils/jwt";

/** 无需认证的 admin 路径（登录、登出、工具类） */
const ADMIN_PUBLIC_PATHS = ["/api/admin/login", "/api/admin/logout"];

const isAdminPublicPath = (pathname: string) =>
  ADMIN_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;

  // 普通业务接口：需有效 JWT
  if (pathname.startsWith("/api/entry")) {
    const payload = getAuthPayload(event);
    if (!payload?.id) {
      return noPermissions("未授权或 token 无效");
    }
  }
  // 管理后台接口：需有效 JWT 且 roles 含 admin
  else if (pathname.startsWith("/api/admin")) {
    if (isAdminPublicPath(pathname)) {
      return; // 登录、登出、getPassword 放行
    }
    const payload = getAuthPayload(event);
    if (!payload?.id) {
      return noPermissions("未授权或 token 无效");
    }
    if (!hasAdminRole(payload.roles)) {
      return noPermissions("需要管理员权限");
    }
  }
});
