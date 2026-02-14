import crypto from "crypto";
import type { Result } from "./model";

// EncryptBySHA256 使用 SHA-256 算法加密字符串
export const encryptBySHA256 = (userName: string, password: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(userName + password);
  return hash.digest("hex");
};

export const success = <T>(data?: T): Result<T> => {
  return {
    c: 200,
    m: "",
    d: data,
  };
};

export const error = <T>(m: string, d?: T): Result<T> => {
  return {
    c: 500,
    m: m,
    d: d,
  };
};

export const noPermissions = <T>(message?: string): Result<T> => {
  return {
    c: 400,
    m: message || "NO Permissions",
  };
};

export const getUUID = (num: number) => {
  const codes =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

  let uuid = "";
  for (let i = 0; i < num; i++) {
    const randomNumber = Math.floor(Math.random() * 62) + 1;
    uuid += codes[randomNumber];
  }
  return uuid;
};
