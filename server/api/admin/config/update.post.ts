import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, description, keywords, version, openRegister } = body;

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (keywords !== undefined) data.keywords = keywords;
  if (version !== undefined) data.version = version;
  if (openRegister !== undefined) data.openRegister = Boolean(openRegister);

  const updated = await prisma.systemConfig.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      title: title ?? null,
      description: description ?? null,
      keywords: keywords ?? null,
      version: version ?? null,
      openRegister: Boolean(openRegister ?? false),
    },
    update: data,
  });
  return success(updated);
});
