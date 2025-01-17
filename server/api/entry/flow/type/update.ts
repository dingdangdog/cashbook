import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.bookId) {
    return error("Not Find ID");
  }
  if (!body.value || !body.type || !body.oldValue) {
    return error("Not Find value");
  }

  const where: any = {
    bookId: body.bookId,
  };
  const data: any = {};
  if (body.type == "支出类型/收入类型") {
    where.industryType = String(body.oldValue);
    data.industryType = String(body.value);
  } else if (body.type == "支付方式/收款方式") {
    where.payType = String(body.oldValue);
    data.payType = String(body.value);
  } else {
    return error("Unknown Type");
  }

  const updated = await prisma.flow.updateMany({
    where,
    data,
  });
  return success(updated);
});
