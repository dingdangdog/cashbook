import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // 获取请求体

  if (!body.bookId) {
    return error("Not Find BookId");
  }

  // add/overwrite
  const mode = String(body.mode);
  const flows: any[] = body.flows;
  const userId = await getUserId(event);

  if (mode == "overwrite") {
    const del = await prisma.flow.deleteMany({
      where: {
        bookId: body.bookId,
      },
    });
  }
  const datas: any[] = [];
  flows.forEach((flow) => {
    datas.push({
      userId,
      bookId: body.bookId,
      name: flow.name,
      day: flow.day,
      description: flow.description,
      flowType: flow.flowType,
      invoice: flow.invoice ? String(flow.invoice) : null,
      money: Number(flow.money),
      payType: flow.payType,
      industryType: flow.type ? flow.type : flow.industryType || "",
      attribution: flow.attribution,
    });
  });
  // 在数据库中添加新数据
  const created = await prisma.flow.createMany({
    data: datas,
  });
  return success(created);
});
