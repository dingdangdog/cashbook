import jwt from "jsonwebtoken";

/** JWT 解码后的 payload 结构 */
export interface AuthPayload {
  id: number;
  username: string;
  name?: string;
  email?: string | null;
  roles?: string | null;
}

/** 从 Authorization header 或 Cookie 解析并验证 JWT，返回完整 payload */
export const getAuthPayload = (event: any): AuthPayload | null => {
  let token =
    getHeader(event, "Authorization") || getCookie(event, "Authorization");
  if (token?.startsWith("Bearer ")) token = token.slice(7);
  const secretKey = useRuntimeConfig().authSecret;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secretKey) as AuthPayload & {
      iat?: number;
      exp?: number;
    };
    return {
      id: Number(decoded?.id || 0),
      username: decoded?.username || "",
      name: decoded?.name,
      email: decoded?.email,
      roles: decoded?.roles ?? null,
    };
  } catch {
    return null;
  }
};

/** 是否具有 admin 角色 */
export const hasAdminRole = (roles: string | null | undefined): boolean => {
  if (!roles) return false;
  return roles
    .split(",")
    .map((r) => r.trim())
    .includes("admin");
};

export const getUserId = async (
  // @ts-ignore
  event: H3Event<EventHandlerRequest>,
): Promise<number> => {
  const payload = getAuthPayload(event);
  return payload?.id ?? 0;
};
