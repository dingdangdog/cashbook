import crypto from "crypto";

// EncryptBySHA256 使用 SHA-256 算法加密字符串
export const encryptBySHA256 = (userName: string, password: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(userName + password);
  return hash.digest("hex");
};

export const success = (data?: any): Result<any> => {
  return {
    c: 200,
    m: "",
    d: data,
  };
};

export const error = (m: any, d?: any): Result<any> => {
  return {
    c: 500,
    m: m,
    d: d,
  };
};

export const noPermissions = (): Result<any> => {
  return {
    c: 400,
    m: "NO Permissions",
    d: "",
  };
};

import { getToken } from "#auth";
// @ts-ignore
export const getUserId = async (event: H3Event<EventHandlerRequest>) => {
  const token = await getToken({ event });
  // console.log("getUserId", token);
  return Number(token?.id || 0);
};
