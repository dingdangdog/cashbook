import prisma from "~/lib/prisma";

export const initTypeRelation = async (bookId?: string) => {
  if (!bookId) {
    bookId = "0";
  }
  // 初始化 TypeRelation 配置
  const types = await prisma.typeRelation.count({ where: { bookId } });
  // console.log("types", types);
  if (types < 1) {
    console.log("~初始化类型转换数据~" + bookId);
    const typeRelations = {
      食品酒饮: "餐饮美食",
      餐饮美食: "餐饮美食",
      家居家装: "日用百货",
      日用百货: "日用百货",
      鞋服箱包: "日用百货",
      清洁纸品: "日用百货",
      医疗保健: "医疗健康",
      医疗健康: "医疗健康",
      充值缴费: "充值缴费",
      教育培训: "教育培训",
      图书文娱: "文化休闲",
      运动户外: "文化休闲",
      文体玩具: "文化休闲",
      文化休闲: "文化休闲",
      微信红包: "转账红包",
      "微信红包（单发）": "转账红包",
      "微信红包（群红包）": "转账红包",
      转账红包: "转账红包",
      转账: "转账红包",
      二维码收款: "微信交易",
      微信交易: "微信交易",
      商户消费: "微信交易",
      扫二维码付款: "微信交易",
      小金库: "投资理财",
      投资理财: "投资理财",
      收入: "投资理财",
      "转入零钱通-来自零钱": "投资理财",
      手机通讯: "数码电器",
      数码电器: "数码电器",
      电脑办公: "数码电器",
      服饰内衣: "服饰装扮",
      服饰装扮: "服饰装扮",
      钟表眼镜: "服饰装扮",
      美妆个护: "美容美发",
      美容美发: "美容美发",
      汽车用品: "爱车养车",
      爱车养车: "爱车养车",
      亲友代付: "亲友代付",
      亲属卡交易: "亲友代付",
      "亲属卡交易-退款": "退款",
      "美团平台商户-退款": "退款",
      退款: "退款",
    };

    const dataList: any[] = [];

    for (const [s, t] of Object.entries(typeRelations)) {
      dataList.push({
        bookId: bookId,
        userId: 0,
        source: s,
        target: t,
      });
    }
    await prisma.typeRelation.createMany({
      data: dataList,
    });
  }
};
