import prisma from "~~/server/lib/prisma";
import { initTypeRelation } from "../utils/data";

export default defineNitroPlugin((nitroApp) => {
  // 只执行一次的Hook，初始化数据库
  nitroApp.hooks.hookOnce("request", async () => {
    // 初始化系统设置
    const nums = await prisma.systemConfig.count();
    if (nums < 1) {
      await prisma.systemConfig.create({
        data: {
          id: 1,
          title: "Cashbook",
          description: "Cashbook",
          keywords: "Cashbook",
        },
      });
      console.log("Init System Settings");
    }
    await prisma.systemConfig.update({
      data: { version: String(useRuntimeConfig().appVersion) },
      where: {
        id: 1,
      },
    });

    // 初始化主题（仅在数据库无任何主题时创建默认主题；避免覆盖用户自定义）
    const themeCount = await prisma.systemTheme.count();
    if (themeCount < 1) {
      const lightColors = {
        background: "255 255 255",
        foreground: "15 23 42",
        surface: "248 250 252",
        surfaceMuted: "241 245 249",
        border: "226 232 240",
        muted: "100 116 139",
        primary: {
          "50": "240 253 244",
          "100": "220 252 231",
          "200": "187 247 208",
          "300": "134 239 172",
          "400": "74 222 128",
          "500": "34 197 94",
          "600": "22 163 74",
          "700": "21 128 61",
          "800": "22 101 52",
          "900": "20 83 45",
          "950": "5 46 22",
        },
        secondary: {
          "50": "248 250 252",
          "100": "241 245 249",
          "200": "226 232 240",
          "300": "203 213 225",
          "400": "148 163 184",
          "500": "100 116 139",
          "600": "71 85 105",
          "700": "51 65 85",
          "800": "30 41 59",
          "900": "15 23 42",
          "950": "2 6 23",
        },
      };

      // 暗色：中性黑系（无蓝/紫偏色），R≈G≈B
      const darkColors = {
        background: "10 10 10",
        foreground: "250 250 250",
        surface: "23 23 23",
        surfaceMuted: "38 38 38",
        border: "64 64 64",
        muted: "163 163 163",
        primary: {
          "50": "240 253 244",
          "100": "220 252 231",
          "200": "187 247 208",
          "300": "134 239 172",
          "400": "74 222 128",
          "500": "34 197 94",
          "600": "22 163 74",
          "700": "21 128 61",
          "800": "22 101 52",
          "900": "20 83 45",
          "950": "5 46 22",
        },
        secondary: {
          "50": "250 250 250",
          "100": "245 245 245",
          "200": "229 229 229",
          "300": "212 212 212",
          "400": "163 163 163",
          "500": "115 115 115",
          "600": "82 82 82",
          "700": "64 64 64",
          "800": "38 38 38",
          "900": "23 23 23",
          "950": "10 10 10",
        },
      };

      await prisma.$transaction([
        prisma.systemTheme.create({
          data: {
            code: "light-green",
            name: "亮色-白绿",
            mode: "light",
            colors: JSON.stringify(lightColors),
            isActive: true,
            isDefault: true,
            sortBy: 1,
          },
        }),
        prisma.systemTheme.create({
          data: {
            code: "dark-green",
            name: "暗色-黑绿",
            mode: "dark",
            colors: JSON.stringify(darkColors),
            isActive: true,
            isDefault: true,
            sortBy: 1,
          },
        }),
      ]);
      console.log("Init Themes");
    } else {
      // 若已有主题但没有默认主题，则为每个模式补一个默认主题（不改颜色）
      for (const mode of ["light", "dark"] as const) {
        const hasDefault = await prisma.systemTheme.count({
          where: { mode, isActive: true, isDefault: true },
        });
        if (hasDefault > 0) {
          continue;
        }
        const firstActive = await prisma.systemTheme.findFirst({
          where: { mode, isActive: true },
          orderBy: [{ sortBy: "asc" }, { createdAt: "asc" }],
        });
        if (firstActive) {
          await prisma.systemTheme.update({
            where: { id: firstActive.id },
            data: { isDefault: true },
          });
        }
      }
    }
    // 保证eliminate字段有值，防止业务出错
    await prisma.$executeRaw`UPDATE "Flow" SET "eliminate" = 0 WHERE "eliminate" is null;`;
    initTypeRelation();
  });
});
