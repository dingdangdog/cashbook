import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const typeRelations = await prisma.typeRelation.findMany();
  return success(typeRelations);
});
