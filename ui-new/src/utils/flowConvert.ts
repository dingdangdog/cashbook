import type { Flow } from '@/types/model/flow'
import { typeRelation } from './store'

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
 * 支付宝
 * @param row
 * @param indexMap
 */
export function alipayConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {}
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = String(row[indexMap.get('收/支')])
  // + '' 防止数据不是字符串导致报错
  flow.type = typeConvert(row[indexMap.get('交易分类')])
  flow.payType = '支付宝'
  flow.money = row[indexMap.get('金额')]
  flow.name = String(row[indexMap.get('交易对方')])
  flow.description = row[indexMap.get('商品说明')] + '-' + row[indexMap.get('备注')]
  return flow
}

export function typeConvert(type: any): string {
  // console.log(type, typeRelation.value[type])
  return typeRelation.value[type] || '其他'
}

/**
 * 微信支付
 * @param row
 * @param indexMap
 */
export function wxpayConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {}
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = row[indexMap.get('收/支')] == '/' ? '不计收支' : row[indexMap.get('收/支')];
  flow.type = String(typeConvert(row[indexMap.get('交易类型')]))
  flow.payType = '微信'
  flow.money = parseFloat((row[indexMap.get('金额(元)')]).replace('¥', ''))
  flow.name = String(row[indexMap.get('商品')])
  flow.description = row[indexMap.get('交易对方')] + '-' + row[indexMap.get('支付方式')] + '-' + row[indexMap.get('备注')]
  return flow
}


/**
 * 京东金融
 * @param row
 * @param indexMap
 */
export function jdFinanceConvert(row: any[], indexMap: Map<any, any>): Flow {
  const flow: Flow = {}
  flow.day = row[indexMap.get('交易时间')]
  flow.flowType = String(row[indexMap.get('收/支')])
  flow.type = typeConvert(row[indexMap.get('交易分类')])
  flow.payType = '京东金融'
  flow.money = parseFloat(row[indexMap.get('金额')])
  flow.name = String(row[indexMap.get('交易说明')])
  flow.description = row[indexMap.get('商户名称')] + '-' + row[indexMap.get('收/付款方式')] + '-' + row[indexMap.get('备注')]
  return flow
}
