import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, target, source } = body;
  if (!id) {
    return error("Not Find ID");
  }
  const updated = await prisma.typeRelation.update({
    where: { id },
    data: {
      target,
      source,
    },
  });
  return success(updated);
});
