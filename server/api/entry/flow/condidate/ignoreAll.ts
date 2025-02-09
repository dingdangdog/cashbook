import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // const userId = await getUserId(event);
  const { ids, bookId } = body;
  if (!ids || !bookId) {
    return error("Not Find ID");
  }
  if (ids.length <= 0) {
    return error("无数据");
  }
  const idsJoin = ids.join(",");
  // console.log(
  //   `UPDATE "Flow" SET "eliminate" = -1 WHERE "bookId" = \"${String(
  //     bookId
  //   )}\" AND "id" in (${idsJoin});`
  // );
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "Flow" SET "eliminate" = -1 WHERE "bookId" = '${String(
      bookId
    )}' AND "id" in (${idsJoin});`
  );

  return success(updated);
});
