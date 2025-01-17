import { getServerSession } from "#auth";
import { noPermissions } from "../utils/common";
// import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // 校验 API 请求
  if (url.pathname.startsWith("/api/entry")) {
    const session = await getServerSession(event);

    if (!session?.user) {
      // 如果没有会话，返回未授权
      console.log("No Authorization");
      return noPermissions();
    }

    // 检查用户是否有足够权限访问前台接口
    // 可根据会话中的用户信息进行权限判断
    const user = session.user;
    if (!user) {
      console.log("No User Authorization");
      return noPermissions();
    }

    // 如果需要角色权限检查，可以扩展
    // if (user.role !== "user") {
    //   console.log("Insufficient User Permissions");
    //   return noPermissions();
    // }
  } else if (url.pathname.startsWith("/api/admin/entry")) {
    // 后台管理接口
    const Admin = getHeader(event, "Admin");
    if (!Admin) {
      console.log("No Admin");
      return noPermissions();
    }
    const runtimeConfig = useRuntimeConfig();
    if (
      Admin !=
      encryptBySHA256(runtimeConfig.adminUsername, runtimeConfig.adminPassword)
    ) {
      console.log("Admin is Wrong!");
      deleteCookie(event, "Admin");
      return noPermissions();
    }
  }
});
