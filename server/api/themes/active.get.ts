import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

type ThemeMode = "light" | "dark";

const pickActiveTheme = async (mode: ThemeMode) => {
  const defaultTheme = await prisma.systemTheme.findFirst({
    where: { mode, isActive: true, isDefault: true },
    orderBy: [{ sortBy: "asc" }, { createdAt: "asc" }],
  });
  if (defaultTheme) {
    return defaultTheme;
  }

  return prisma.systemTheme.findFirst({
    where: { mode, isActive: true },
    orderBy: [{ sortBy: "asc" }, { createdAt: "asc" }],
  });
};

export default defineEventHandler(async () => {
  try {
    const [light, dark] = await Promise.all([
      pickActiveTheme("light"),
      pickActiveTheme("dark"),
    ]);

    return success({ light, dark });
  } catch (err: any) {
    console.error("获取激活主题失败:", err);
    return error("获取激活主题失败", err?.message);
  }
});
