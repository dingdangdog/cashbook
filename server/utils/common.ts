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

export const noPermissions = (message?: string): Result<any> => {
  return {
    c: 400,
    m: message || "NO Permissions",
    d: "",
  };
};

import jwt from "jsonwebtoken";

export const getUserId = async (
  // @ts-ignore
  event: H3Event<EventHandlerRequest>
): Promise<number> => {
  const token = getHeader(event, "Authorization");
  const secretKey = useRuntimeConfig().authSecret;

  if (!token) {
    return 0; //  Token 不存在，返回 null 表示未认证
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded: any) => {
      if (err) {
        //  Token 验证失败
        console.error("JWT verification failed:", err.message); // 记录错误信息 (可选)
        return resolve(0); // 返回 null 表示验证失败，获取不到 userId
        // 或者，你也可以 reject(err)  并让调用者处理错误，取决于你的错误处理策略
      }

      // Token 验证成功
      const userId = Number(decoded?.id || 0); // 提取 userId，并确保是数字类型
      resolve(userId);
    });
  });
};
