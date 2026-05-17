import { ensureDatabaseMigrations } from "~~/server/lib/db-migrations";
import prisma from "~~/server/lib/prisma";
import { initTypeRelation } from "../utils/data";

async function runStartupInitialization() {
  await ensureDatabaseMigrations();

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
  await prisma.$executeRaw`UPDATE "Flow" SET "eliminate" = 0 WHERE "eliminate" is null;`;
  await initTypeRelation();
}

export default defineNitroPlugin(async () => {
  await runStartupInitialization();
});
