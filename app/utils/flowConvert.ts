import { typeRelationStore } from "./store";

// | 本软件类型 | 支付宝 | 微信 | 京东金融 | 备注 |
// | -------- | ---- | -------- | ---- | ---- |
// | 数码电器 | 数码电器 |      | 数码电器/手机通讯/电脑办公 | 电子产品、家电等 |
// | 充值缴费 | 充值缴费 |      | 充值缴费 | 水电、话费等 |
// | 美容美发 | 美容美发 | | 美妆个护 | 理发、护肤等 |
// | 转账红包 | 转账红包 | 微信红包/转账                    |          | 转账、红包等 |
// | 日用百货 | 日用百货 |      | 清洁纸品/鞋服箱包 | 垃圾袋、卫生纸等 |
// | 服饰装扮 | 服饰装扮 |      | 服饰内衣/钟表眼镜 | 鞋服等 |
// | 文化休闲 | 文化休闲/运动户外 |      | 图书文娱/文体玩具 | 书籍、游戏、视频软件VIP等 |
// | 餐饮美食 | 餐饮美食 |      | 食品酒饮 | 吃好喝好 |
// | 医疗健康 | 医疗健康 | | 医疗保健 | 药品、保养品等 |
// | 亲友代付 | 亲友代付 | 亲属卡交易 |          | 如题 |
// | 家居家装 | 家居家装 |      |          | 家具、装修用品等 |
// | 爱车养车 | 爱车养车 |      | 汽车用品 | 保养、油气、过路费等 |
// | 投资理财 | 收入/投资理财 |      | 小金库 | 理财收益、签到红包等 |
// | 教育培训 | 教育培训 | | 教育培训 | 网课、培训等 |
// | 退款 | 退款 | 退款 |          |  |
// | 微信交易 |  | 扫二维码付款/二维码收款/商户消费 | | 这部分交易需要人工分类 |
// |  其他    | 其他/商业服务/生活服务/借用借还 |      | 其他网购/其他/网购/收发快递/白条 | 一些少见或未知类型，通常需要人工分类 |

/**
 * 模板导入
 * @param row
 * @param indexMap
 */
export function templateConvert(
  row: any[],
  indexMap: Record<string, number>
): Flow {
  const flow: Flow | any = {};
  flow.day = row[indexMap["交易时间"]];
  flow.flowType = String(row[indexMap["收/支"]]);
  flow.industryType = String(row[indexMap["交易分类"]]);
  flow.payType = String(row[indexMap["收/付款方式"]]);
  flow.money = row[indexMap["金额"]];
  flow.attribution = String(row[indexMap["流水归属"]]);
  flow.name = String(row[indexMap["交易对方"]]);
  flow.description = String(row[indexMap["备注"]]);
  return flow;
}

/** 订单号按字符串读取并 trim，避免制表符/空格和科学计数法、精度丢失 */
function safeOrderNo(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number") {
    // 超过安全整数后已丢失精度，宁可放弃该 flowNo，也不要用错误值参与去重
    if (!Number.isFinite(v) || !Number.isInteger(v) || !Number.isSafeInteger(v)) {
      return "";
    }
    return String(v).trim().slice(0, 50);
  }
  return String(v).trim().slice(0, 50);
}

/**
 * 支付宝（含流水编号：交易订单号，用于去重）
 */
export function alipayConvert(
  row: any[],
  indexMap: Record<string, number>
): Flow {
  const flow: Flow | any = {};
  flow.day = row[indexMap["交易时间"]];
  flow.flowType = String(row[indexMap["收/支"]]);
  flow.industryType = typeConvert(row[indexMap["交易分类"]]);
  flow.payType = "支付宝";
  flow.money = row[indexMap["金额"]];
  flow.name = String(row[indexMap["交易对方"]]);
  flow.description =
    row[indexMap["商品说明"]] +
    "-" +
    row[indexMap["收/付款方式"]] +
    "-" +
    row[indexMap["备注"]];
  const raw = row[indexMap["交易订单号"]];
  const flowNoStr = safeOrderNo(raw);
  if (flowNoStr !== "") flow.flowNo = flowNoStr;
  return flow;
}

export function typeConvert(type: any): string {
  // 20240922 类型转换，如果没有匹配的类型则保留原类型
  // 20250116 新转换实现
  const ts = typeRelationStore.value.filter((t) => t.source == type);
  return ts.length > 0 ? ts[0].target : type;
}

/**
 * 微信支付（含流水编号：交易单号，用于去重）
 */
export function wxpayConvert(
  row: any[],
  indexMap: Record<string, number>
): Flow {
  const flow: Flow | any = {};
  flow.day = row[indexMap["交易时间"]];
  flow.flowType =
    row[indexMap["收/支"]] == "/" ? "不计收支" : row[indexMap["收/支"]];
  flow.industryType = String(typeConvert(row[indexMap["交易类型"]]));
  flow.payType = "微信";
  flow.money = parseFloat(row[indexMap["金额(元)"]].replace("¥", ""));
  flow.name = String(row[indexMap["商品"]]);
  flow.description =
    row[indexMap["交易对方"]] +
    "-" +
    row[indexMap["支付方式"]] +
    "-" +
    row[indexMap["备注"]];
  const raw = row[indexMap["交易单号"]];
  const flowNoStr = safeOrderNo(raw);
  if (flowNoStr !== "") flow.flowNo = flowNoStr;
  return flow;
}

/**
 * 京东金融（含流水编号：交易订单号，用于去重）
 */
export function jdFinanceConvert(
  row: any[],
  indexMap: Record<string, number>
): Flow {
  const flow: Flow | any = {};
  flow.day = row[indexMap["交易时间"]];
  flow.flowType = String(row[indexMap["收/支"]]);
  flow.industryType = typeConvert(row[indexMap["交易分类"]]);
  flow.payType = "京东金融";

  const jdMoney = String(row[indexMap["金额"]]);
  const match = jdMoney.match(/^(\d*\.?\d+)(.*)/);
  flow.money = match ? match[1] : jdMoney;
  const desc = match ? match[2] : "";
  flow.name = String(row[indexMap["交易说明"]]);
  flow.description =
    desc +
    row[indexMap["商户名称"]] +
    "-" +
    row[indexMap["收/付款方式"]] +
    "-" +
    row[indexMap["备注"]];
  const raw = row[indexMap["交易订单号"]];
  const flowNoStr = safeOrderNo(raw);
  if (flowNoStr !== "") flow.flowNo = flowNoStr;
  return flow;
}
