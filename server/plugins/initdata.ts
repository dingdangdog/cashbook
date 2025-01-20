import prisma from "~/lib/prisma";
import { initTypeRelation } from "../utils/data";

export default defineNitroPlugin((nitroApp) => {
  // 只执行一次的Hook，初始化数据库
  nitroApp.hooks.hookOnce("request", async () => {
    // 初始化系统设置
    const nums = await prisma.systemSetting.count();
    if (nums < 1) {
      await prisma.systemSetting.create({
        data: {
          id: 1,
          title: "Cashbook",
          description: "Cashbook",
          keywords: "Cashbook",
        },
      });
      console.log("Init System Settings");
    }
    await prisma.systemSetting.update({
      data: { version: String(useRuntimeConfig().appVersion) },
      where: {
        id: 1,
      },
    });
    initTypeRelation();
  });
});
